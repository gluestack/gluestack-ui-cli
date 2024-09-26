import os from 'os';
import fs, { stat } from 'fs-extra';
import simpleGit from 'simple-git';
import { config } from '../config';
import { exec, execSync, spawnSync } from 'child_process';
import finder from 'find-package-json';
import { join, dirname, extname, relative, basename } from 'path';
import {
  log,
  spinner,
  confirm,
  isCancel,
  cancel,
  select,
} from '@clack/prompts';
import {
  Dependencies,
  Dependency,
  dependenciesConfig,
  projectBasedDependencies,
} from '../dependencies';
import { installNativeWind } from './init';

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
        !['.tsx', '.ts', '.jsx', '.js', '.json'].includes(
          extname(file).toLowerCase()
        ) && file !== config.providerComponent
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
    process.exit(1);
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

const wait = (msec: number): Promise<void> =>
  new Promise<void>((resolve, _) => {
    setTimeout(resolve, msec);
  });

//checking from root
// const detectLockFile = (): string | null => {
//   const packageLockPath = join(projectRootPath, 'package-lock.json');
//   const yarnLockPath = join(projectRootPath, 'yarn.lock');
//   const pnpmLockPath = join(projectRootPath, 'pnpm-lock.yaml');

//   if (fs.existsSync(packageLockPath)) {
//     return 'npm';
//   } else if (fs.existsSync(yarnLockPath)) {
//     return 'yarn';
//   } else if (fs.existsSync(pnpmLockPath)) {
//     return 'pnpm';
//   } else {
//     return null;
//   }
// };

//checking from cwd
function findLockFileType(): string | null {
  let currentDir = currDir;
  while (true) {
    const packageLockPath = join(currentDir, 'package-lock.json');
    const yarnLockPath = join(currentDir, 'yarn.lock');
    const pnpmLockPath = join(currentDir, 'pnpm-lock.yaml');
    const bunLockPath = join(currentDir, 'bun.lockb');

    if (fs.existsSync(packageLockPath)) {
      return 'npm';
    } else if (fs.existsSync(yarnLockPath)) {
      return 'yarn';
    } else if (fs.existsSync(pnpmLockPath)) {
      return 'pnpm';
    } else if (fs.existsSync(bunLockPath)) {
      return 'bun';
    } else if (currentDir === dirname(currentDir)) {
      // Reached root directory
      return null;
    } else {
      currentDir = dirname(currentDir);
    }
  }
}

function getPackageMangerFlag(options: any) {
  if (options.useBun) {
    config.packageManager = 'bun';
    return 'bun';
  }
  if (options.usePnpm) {
    config.packageManager = 'pnpm';
    return 'pnpm';
  }
  if (options.useYarn) {
    config.packageManager = 'yarn';
    return 'yarn';
  }
  if (options.useNpm) {
    config.packageManager = 'npm';
    return 'npm';
  }
}

const promptVersionManager = async (): Promise<any> => {
  const packageManager = await select({
    message:
      'No lockfile detected. Please select a package manager to install dependencies:',
    options: [
      { value: 'npm', label: 'npm', hint: 'recommended' },
      { value: 'yarn', label: 'yarn' },
      { value: 'pnpm', label: 'pnpm' },
      { value: 'bun', label: 'bun' },
    ],
  });
  if (isCancel(packageManager)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return packageManager;
};

const installDependencies = async (
  input: string[] | string,
  additionalDependencies?: Dependencies | undefined
): Promise<void> => {
  try {
    //add npmrc file for legacy-peer-deps-support
    execSync('npm config --location=project set legacy-peer-deps=true');
    let versionManager: string | null;
    if (!config.packageManager) {
      versionManager = findLockFileType();
      if (!versionManager) {
        versionManager = await promptVersionManager();
      }
    } else versionManager = config.packageManager;
    const dependenciesToInstall: {
      dependencies: Dependency;
      devDependencies: Dependency;
    } = { dependencies: {}, devDependencies: {} };

    //add additional dependencies if any
    if (additionalDependencies) {
      Object.assign(
        dependenciesToInstall.dependencies,
        additionalDependencies.dependencies
      );
      additionalDependencies?.devDependencies &&
        Object.assign(
          dependenciesToInstall.devDependencies,
          additionalDependencies?.devDependencies
        );
    }

    //get dependencies from config
    const gatherDependencies = (components: string[]): void => {
      components.forEach((component) => {
        if (dependenciesConfig[component]) {
          Object.assign(
            dependenciesToInstall.dependencies,
            dependenciesConfig[component].dependencies
          );
          if (dependenciesConfig[component].devDependencies) {
            Object.assign(
              dependenciesToInstall.devDependencies,
              dependenciesConfig[component].devDependencies
            );
          }
        }
      });
    };

    //generate install command
    const generateInstallCommand = (deps: Dependency, flag: string): string => {
      return (
        Object.entries(deps)
          .map(([pkg, version]) => `${pkg}@${version}`)
          .join(' ') + flag
      );
    };

    //get input based dependencies
    if (input === '--all') {
      gatherDependencies(Object.keys(dependenciesConfig));
    } else if (Array.isArray(input)) {
      gatherDependencies(input);
    }

    let installCommand = '',
      devInstallCommand = '';

    switch (versionManager) {
      case 'npm':
        installCommand = `npm install ${generateInstallCommand(dependenciesToInstall.dependencies, '')}`;
        devInstallCommand = `npm install ${generateInstallCommand(dependenciesToInstall.devDependencies, '  --save-dev')}`;
        break;
      case 'yarn':
        installCommand = `yarn add ${generateInstallCommand(dependenciesToInstall.dependencies, '')}`;
        devInstallCommand = `yarn add ${generateInstallCommand(dependenciesToInstall.devDependencies, ' --dev')}`;
        break;
      case 'pnpm':
        installCommand = `pnpm i ${generateInstallCommand(dependenciesToInstall.dependencies, '')}`;
        devInstallCommand = `pnpm i ${generateInstallCommand(dependenciesToInstall.devDependencies, '')}`;
        break;
      case 'bun':
        installCommand = `bun add ${generateInstallCommand(dependenciesToInstall.dependencies, '')}`;
        devInstallCommand = `bun add ${generateInstallCommand(dependenciesToInstall.devDependencies, ' --dev')}`;
        break;
      default:
        throw new Error('Invalid package manager selected');
    }
    const s = spinner();
    s.start(
      '⏳ Installing dependencies. This might take a couple of minutes...'
    );

    try {
      await installNativeWind(versionManager);
      let depResult;
      let devDepResult;

      if (Object.keys(dependenciesToInstall.dependencies || {}).length > 0) {
        depResult = spawnSync(installCommand, {
          cwd: currDir,
          stdio: 'inherit',
          shell: true,
        });
      }
      if (Object.keys(dependenciesToInstall.devDependencies || {}).length > 0) {
        devDepResult = spawnSync(devInstallCommand, {
          cwd: currDir,
          stdio: 'inherit',
          shell: true,
        });
      }

      if (
        (depResult && depResult.status) ||
        (devDepResult && devDepResult.status)
      ) {
        throw new Error();
      }

      s.stop(`Dependencies have been installed successfully.`);
    } catch (err) {
      throw new Error('Error installing dependencies.');
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    process.exit(1);
  }
};

//function to detect type of project
async function detectProjectType(directoryPath: string): Promise<string> {
  try {
    // Check for files or directories unique to Next.js, Expo, or React Native CLI projects
    const nextjsFiles: string[] = ['next.config.js', 'next.config.mjs'];
    const expoFiles: string[] = ['app.json', 'app.config.js', 'app.config.ts'];
    const reactNativeFiles: string[] = ['ios', 'android'];
    const packageJsonPath = rootPackageJsonPath;
    // Check for presence of Next.js files/directories
    const isNextJs: boolean = await Promise.all(
      nextjsFiles.map((file) => fs.pathExists(`${directoryPath}/${file}`))
    ).then((results) => results.some(Boolean));

    // Check for presence of Expo files/directories
    const isExpo: boolean = await Promise.all(
      expoFiles.map((file) => fs.pathExists(`${directoryPath}/${file}`))
    ).then((results) => results.some(Boolean));

    // Check for presence of React Native CLI files/directories
    const isReactNative: boolean = await Promise.all(
      reactNativeFiles.map((file) => fs.pathExists(`${directoryPath}/${file}`))
    ).then((results) => results.every(Boolean));

    // Check for presence of package.json file
    if (fs.existsSync(packageJsonPath) && packageJsonPath !== '') {
      const packageJson = await fs.readJSONSync(packageJsonPath);

      // Determine the project type based on the presence of specific files/directories
      if (
        isNextJs &&
        packageJson.dependencies &&
        packageJson.dependencies.next
      ) {
        const userConfirm = await getConfirmation(
          'Detected a Next JS project, continue?'
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
          'Detected a Expo project, continue?'
        );
        if (userConfirm) return config.expoProject;
      } else if (
        isReactNative &&
        packageJson.dependencies &&
        packageJson.dependencies['react-native'] &&
        !packageJson.dependencies.expo
      ) {
        const userConfirm = await getConfirmation(
          'Detected a React Native CLI project, continue?'
        );
        if (userConfirm) return config.reactNativeCLIProject;
      }
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
      {
        value: 'library',
        label: 'library',
      },
    ],
  });
  if (isCancel(frameworkInput)) {
    cancel('Operation cancelled.');
    process.exit(1);
  }
  return frameworkInput as string;
}

// Function to get existing component style is not used in the current implementation
async function getExistingComponentStyle() {
  //refactor this function so that we can directly fetch existing config path
  if (fs.existsSync(join(currDir, config.UIconfigPath))) {
    const fileContent: string = fs.readFileSync(
      join(currDir, config.UIconfigPath),
      'utf8'
    );
    // Define a regular expression pattern to match import statements
    const importPattern: RegExp = new RegExp(
      `import {\\s*\\w+\\s*} from ['"]nativewind['"]`,
      'g'
    );
    if (importPattern.test(fileContent)) {
      config.style = config.nativeWindRootPath;
      return config.nativeWindRootPath;
    } else {
      config.style = config.gluestackStyleRootPath;
      return config.gluestackStyleRootPath;
    }
  }
}

//function to return additional dependencies based on project type
async function getAdditionalDependencies(
  projectType: string | undefined,
  style: string
) {
  try {
    let additionalDependencies: {
      dependencies: {};
      devDependencies?: {};
    } = {
      dependencies: {},
      devDependencies: {},
    };

    if (style === config.nativeWindRootPath) {
      if (projectType && projectType !== 'library') {
        additionalDependencies.dependencies =
          projectBasedDependencies[projectType].dependencies;
        additionalDependencies.devDependencies =
          projectBasedDependencies[projectType]?.devDependencies;
        return additionalDependencies;
      } else return {};
    }
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
}

//regex check for --path input
function isValidPath(path: string): boolean {
  const pathRegex = /^(?!\/{2})[a-zA-Z/.]{1,2}.*/;
  return pathRegex.test(path);
}

const checkWritablePath = async (path: string): Promise<boolean> => {
  const confirmPath = await getConfirmation(
    `\x1b[33mContinue writing components in the above path? :\x1b[0m [If the path is incorrect, please provide the path from the root of the project]
     \n\x1b[34m${join(projectRootPath, path)}
    \x1b[0m`
  );
  if (confirmPath) {
    return true;
  } else {
    process.exit(1);
  }
};

const checkIfFolderExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

function removeHyphen(str: string): string {
  return str.replace(/-/g, '');
}

// Define a callback type
type Callback = (error: Error | null, output: string | null) => void;

function runCliCommand(command: string, callback: Callback): void {
  exec(command, (error, stdout, stderr) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (stderr) {
      callback(new Error(stderr), null);
      return;
    }
    callback(null, stdout);
  });
}

function getRelativePath({
  sourcePath,
  targetPath,
}: {
  sourcePath: string;
  targetPath: string;
}) {
  const sourceDir = dirname(sourcePath);
  const targetDir = dirname(targetPath);

  let relativePath = relative(sourceDir, targetDir);
  // If the relative path is '.' or empty, it means the directories are the same
  if (relativePath === '.' || relativePath === '') {
    // Files are in the same directory
    return './' + basename(targetPath);
  } else {
    // Construct the full relative path
    return join(relativePath, basename(targetPath));
  }
}

async function ensureFilesPromise(filePaths: string[]): Promise<boolean> {
  try {
    // Filter out empty strings, null, and undefined values
    const validPaths = filePaths.filter(
      (path) => path && typeof path === 'string' && path.trim() !== ''
    );
    // Use Promise.all to run all ensureFile operations concurrently
    await Promise.all(validPaths.map((path) => fs.ensureFile(path)));
    return true; // All operations successful
  } catch (error) {
    console.error('Error ensuring files:', error);
    return false; // At least one operation failed
  }
}

export {
  cloneRepositoryAtRoot,
  getAllComponents,
  getAdditionalDependencies,
  detectProjectType,
  isValidPath,
  checkWritablePath,
  projectRootPath,
  installDependencies,
  removeHyphen,
  getRelativePath,
  ensureFilesPromise,
  getPackageMangerFlag,
};
