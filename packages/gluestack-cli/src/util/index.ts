import os from 'os';
import { join, dirname, extname } from 'path';
import util from 'util';
import fs from 'fs-extra';
import {
  log,
  spinner,
  confirm,
  isCancel,
  cancel,
  select,
} from '@clack/prompts';
import finder from 'find-package-json';
import simpleGit from 'simple-git';
import { spawnSync } from 'child_process';
import { config } from '../config';

const stat = util.promisify(fs.stat);
const homeDir = os.homedir();
const currDir = process.cwd();

const getPackageJsonPath = (): string => {
  var f = finder(currDir);
  return f.next().filename || '';
};

const rootPackageJsonPath = getPackageJsonPath();
const projectRootPath: string = dirname(rootPackageJsonPath);

const getAllComponents = (): string[] => {
  const componentList = fs
    .readdirSync(
      join(
        homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style
      )
    )
    .filter(
      (file) =>
        !['.tsx', '.ts', '.jsx', '.js'].includes(extname(file).toLowerCase()) &&
        file !== config.providerComponent
    );
  return componentList;
};

const cloneRepositoryAtRoot = async (rootPath: string) => {
  try {
    const clonedRepoExists = await checkIfFolderExists(rootPath);
    if (clonedRepoExists) {
      const git = simpleGit(rootPath);
      const currBranch = await git.branchLocal();
      if (currBranch.current !== config.branchName) {
        fs.removeSync(rootPath);
        await cloneComponentRepo(rootPath, config.repoUrl);
      }
      if (currBranch.current === config.branchName) {
        log.step('Repository already cloned.');
        await pullComponentRepo(join(homeDir, config.gluestackDir));
      }
    } else {
      const s = spinner();
      s.start('Cloning repository...');
      await cloneComponentRepo(rootPath, config.repoUrl);
      s.stop('Repository cloned successfully.');
    }
  } catch (err) {
    log.error(`\x1b[31m Cloning failed, ${(err as Error).message}\x1b[0m`);
  }
};

const cloneComponentRepo = async (
  targetPath: string,
  gitURL: string
): Promise<void> => {
  const git = simpleGit();
  const s = spinner();
  s.start('⏳ Cloning repository...');
  try {
    await git.clone(gitURL, targetPath, [
      '--depth=1',
      '--branch',
      config.branchName,
    ]);
    s.stop('\x1b[32m' + 'Cloning successful.' + '\x1b[0m');
  } catch (err) {
    s.stop('\x1b[31m' + 'Cloning failed' + '\x1b[0m');
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    process.exit(1);
  }
};

const checkVersion = async (
  repoPath: string,
  tagVersion: string
): Promise<void> => {
  const git = simpleGit(repoPath);
  try {
    const tags = await git.tags();
    const match = tags.all.includes(tagVersion);

    if (!match) {
      const ifConfirm = await confirm({
        message: `\x1b[34mAn update is available, Do you want to update to the latest version?\x1b[0m`,
      });
      if (ifConfirm) {
        fs.removeSync(repoPath);
        await cloneComponentRepo(repoPath, config.repoUrl);
      } else {
        log.info(`Update skipped, using the current version...`);
        return;
      }
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const pullComponentRepo = async (targetpath: string): Promise<void> => {
  const s = spinner();
  s.start('⏳ Pulling latest changes...');
  let retry = 0;
  let success = false;
  while (!success && retry < 3) {
    try {
      await wait(1000);
      await tryGitPull(targetpath);
      success = true;
    } catch (err) {
      log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
      log.error(
        `\x1b[31mPulling failed - retrying... (Attempt ${retry + 1})\x1b[0m`
      );
      retry++;
    }
  }
  if (!success) s.stop('\x1b[31m' + 'Pulling failed!' + '\x1b[0m');
  else s.stop('Git pull successful.');
};

const tryGitPull = async (targetPath: string): Promise<void> => {
  const git = simpleGit(targetPath);
  if (fs.existsSync(targetPath)) {
    await git.pull('origin', config.branchName);
  } else log.error('\x1b[31m' + 'Target path does not exist' + '\x1b[0m');
};

const checkIfFolderExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

const checkIfFileExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch (error) {
    return false;
  }
};

const wait = (msec: number): Promise<void> =>
  new Promise<void>((resolve, _) => {
    setTimeout(resolve, msec);
  });

const detectLockFile = (): string | null => {
  const packageLockPath = join(projectRootPath, 'package-lock.json');
  const yarnLockPath = join(projectRootPath, 'yarn.lock');
  const pnpmLockPath = join(projectRootPath, 'pnpm-lock.yaml');

  if (fs.existsSync(packageLockPath)) {
    return 'npm';
  } else if (fs.existsSync(yarnLockPath)) {
    return 'yarn';
  } else if (fs.existsSync(pnpmLockPath)) {
    return 'pnpm';
  } else {
    return null;
  }
};

const promptVersionManager = async (): Promise<any> => {
  const packageManager = await select({
    message:
      'No lockfile detected. Please select a package manager to install dependencies:',
    options: [
      { value: 'npm', label: 'npm', hint: 'recommended' },
      { value: 'yarn', label: 'yarn' },
      { value: 'pnpm', label: 'pnpm' },
    ],
  });
  if (isCancel(packageManager)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return packageManager;
};

const addDependencies = async (dependenciesToAdd: string[]): Promise<void> => {
  const packageJsonPath = rootPackageJsonPath;
  try {
    // Read in the existing package.json file
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.dependencies = packageJson.dependencies || {};
    // Add each dependency in the provided format
    dependenciesToAdd.forEach((packageName) => {
      if (packageJson.dependencies[packageName]) {
        return;
      } else {
        if (config.DependencyVersion[packageName]) {
          packageJson.dependencies[packageName] =
            config.DependencyVersion[packageName];
        } else if (!packageJson.dependencies[packageName]) {
          packageJson.dependencies[packageName] = 'latest';
        }
      }
    });
    // Write the updated package.json file
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const installPackages = async (
  installationMethod: string | undefined,
  dependencies: string[]
): Promise<void> => {
  let command;
  if (!installationMethod) {
    let versionManager: string | null = detectLockFile();
    if (!versionManager) {
      versionManager = await promptVersionManager();
    }
    switch (versionManager) {
      case 'npm':
        command = `npm install --legacy-peer-deps `;
        break;
      case 'yarn':
        command = `yarn `;

        break;
      case 'pnpm':
        command = `pnpm i --lockfile-only `;
        break;
      default:
        throw new Error('Invalid package manager selected');
    }
  } else {
    switch (installationMethod) {
      case 'npm':
        command = `npm install --legacy-peer-deps`;
        break;
      case 'yarn':
        command = `yarn `;
        break;
      case 'pnpm':
        command = `pnpm i --lockfile-only`;
        break;
      default:
        throw new Error('Invalid package manager selected');
    }
  }

  const s = spinner();
  s.start('⏳ Installing dependencies...');

  try {
    await addDependencies(dependencies);
    spawnSync(command, {
      cwd: projectRootPath,
      stdio: 'inherit',
      shell: true,
    });
    s.stop(`Dependencies have been installed successfully.`);
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    log.error('\x1b[31mError installing dependencies:\x1b[0m');
    log.warning(` - Run \x1b[33m'${command}'\x1b[0m manually!`);
    throw new Error('Error installing dependencies.');
  }
};

const addIndexFile = async (componentsDirectory: string) => {
  try {
    const directories = await fs.readdir(componentsDirectory);
    const componentDirectories = directories.filter((item) =>
      fs.statSync(join(componentsDirectory, item)).isDirectory()
    );
    // Generate import and export statements for each component directory
    const exportStatements = componentDirectories
      .map((component) => `export * from './${component}';`)
      .join('\n');

    const indexContent = `${exportStatements}\n`;
    await fs.writeFile(join(componentsDirectory, 'index.ts'), indexContent);
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

//function to detect type of project
async function detectProjectType(directoryPath: string) {
  try {
    // Check for files or directories unique to Next.js, Expo, or React Native CLI projects
    const nextjsFiles: string[] = ['next.config.js', 'next.config.mjs'];
    const expoFiles: string[] = ['app.json'];
    const reactNativeFiles: string[] = ['ios', 'android'];
    const packageJsonPath = join(currDir, 'package.json');

    // Check for presence of Next.js files/directories
    const isNextJs: boolean = await Promise.all(
      nextjsFiles.map((file) => fs.pathExists(`${directoryPath}/${file}`))
    ).then((results) => results.some(Boolean));

    // Check for presence of Expo files/directories
    const isExpo: boolean = await Promise.all(
      expoFiles.map((file) => fs.pathExists(`${directoryPath}/${file}`))
    ).then((results) => results.every(Boolean));

    // Check for presence of React Native CLI files/directories
    const isReactNative: boolean = await Promise.all(
      reactNativeFiles.map((file) => fs.pathExists(`${directoryPath}/${file}`))
    ).then((results) => results.every(Boolean));

    const packageJson = await fs.readJSONSync(packageJsonPath);

    // Determine the project type based on the presence of specific files/directories
    if (isNextJs && packageJson.dependencies && packageJson.dependencies.next) {
      const userConfirm = await getConfirmation(
        'Detected as Next JS project, continue? (yes/no): '
      );
      if (userConfirm) return config.nextJsProject;
    } else if (
      isExpo &&
      packageJson.dependencies &&
      packageJson.dependencies.expo &&
      packageJson.dependencies['react-native'] &&
      !packageJson.dependencies.next &&
      !isNextJs &&
      !isReactNative
    ) {
      const userConfirm = await getConfirmation(
        'Detected as Expo project, continue? (yes/no): '
      );
      if (userConfirm) return config.expoProject;
    } else if (
      isReactNative &&
      packageJson.dependencies &&
      packageJson.dependencies['react-native'] &&
      !packageJson.dependencies.expo
    ) {
      const userConfirm = await getConfirmation(
        'Detected as React Native CLI project, continue? (yes/no): '
      );
      if (userConfirm) return config.reactNativeCLIProject;
    }
    const frameworkInput = await getFrameworkInput();
    return frameworkInput;
  } catch (err) {
    log.error(`\x1b[31m${err as Error}\x1b[0m`);
    process.exit(1);
  }
}

async function getConfirmation(message: string): Promise<boolean> {
  const confirmInput = await confirm({
    message: message,
  });
  if (isCancel(confirmInput)) {
    cancel('Operation cancelled.');
    process.exit(1);
  }
  return confirmInput;
}

async function getFrameworkInput(): Promise<string> {
  const frameworkInput = await select({
    message: 'Please select the framework you are using:',
    options: [
      {
        value: config.nextJsProject,
        label: 'Next Js',
      },
      { value: config.expoProject, label: 'Expo' },
      {
        value: config.reactNativeCLIProject,
        label: 'React Native CLI',
      },
    ],
  });
  if (isCancel(frameworkInput)) {
    cancel('Operation cancelled.');
    process.exit(1);
  }
  return frameworkInput as string;
}

//function to return additional dependencies based on project type
async function getAdditionalDependencies(
  projectType: string | undefined,
  style: string
) {
  try {
    if (style === config.gluestackStyleRootPath) {
      switch (projectType) {
        case config.nextJsProject:
          return config.GluestackNextJsDependencies;
        case config.expoProject:
          return config.GluestackExpoDependencies;
        case config.reactNativeCLIProject:
          return config.GluestackReactNativeCLIDependencies;
        default:
          throw new Error('Error reading package.json');
      }
    }
    if (style === config.nativeWindRootPath) {
      switch (projectType) {
        case config.nextJsProject:
          return config.NativeWindNextJsDependencies;
        case config.expoProject:
          return config.NativeWindExpoDependencies;
        case config.reactNativeCLIProject:
          return config.NativeWindReactNativeCLIDependencies;
        default:
          throw new Error('Error reading package.json');
      }
    } else throw new Error('Error reading package.json');
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
}

// Function to copy file with checks
const generateSpecificFile = async (
  sourcePath: string,
  targetPath: string,
  fileName: string
): Promise<void> => {
  try {
    // Check if file exists at targetPath
    const exists = await fs.pathExists(targetPath);
    if (exists) {
      const ifConfirm = await confirm({
        message: `File ${fileName} already exists. Do you want to overwrite it? (yes/no): `,
      });
      if (ifConfirm) {
        await fs.copyFile(sourcePath, targetPath);
      } else {
        log.info(`Creating ${fileName} has been skipped...`);
        return;
      }
      // return;
    } else {
      // File does not exist, proceed with copying
      await fs.copyFile(sourcePath, targetPath);
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

export {
  cloneRepositoryAtRoot,
  checkIfFolderExists,
  checkIfFileExists,
  getAllComponents,
  installPackages,
  addIndexFile,
  getAdditionalDependencies,
  detectProjectType,
};