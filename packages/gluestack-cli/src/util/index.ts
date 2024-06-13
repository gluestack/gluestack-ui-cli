import os from 'os';
import { join, dirname, extname } from 'path';
import fs, { stat } from 'fs-extra';
import {
  log,
  spinner,
  confirm,
  isCancel,
  cancel,
  select,
  text,
} from '@clack/prompts';
import finder from 'find-package-json';
import simpleGit from 'simple-git';
import { spawnSync } from 'child_process';
import { config } from '../config';
import { dependenciesConfig, projectBasedDependencies } from '../dependencies';

// const stat = util.promisify(fs.stat);
const homeDir = os.homedir();
const currDir = process.cwd();

const getPackageJsonPath = (): string => {
  var f = finder(currDir);
  return f.next().filename || '';
};

const rootPackageJsonPath = getPackageJsonPath();
const projectRootPath: string = dirname(rootPackageJsonPath);

interface Dependencies {
  [key: string]: string;
}

type Input = string | string[];

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

//checking from cwd
function findLockFileType(): string | null {
  let currentDir = currDir;
  while (true) {
    const packageLockPath = join(currentDir, 'package-lock.json');
    const yarnLockPath = join(currentDir, 'yarn.lock');
    const pnpmLockPath = join(currentDir, 'pnpm-lock.yaml');

    if (fs.existsSync(packageLockPath)) {
      return 'npm';
    } else if (fs.existsSync(yarnLockPath)) {
      return 'yarn';
    } else if (fs.existsSync(pnpmLockPath)) {
      return 'pnpm';
    } else if (currentDir === dirname(currentDir)) {
      // Reached root directory
      return null;
    } else {
      currentDir = dirname(currentDir);
    }
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
    ],
  });
  if (isCancel(packageManager)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return packageManager;
};

const addDependencies = async (
  installationMethod: string | undefined,
  inputComponent: string[] | string,
  additionalDependencies?: Dependencies | undefined
): Promise<void> => {
  try {
    await updatePackageJson(inputComponent, additionalDependencies);
    await installPackages(installationMethod);
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

async function updatePackageJson(
  input: Input,
  additionalDependencies?: Dependencies
): Promise<void> {
  // Read the existing package.json file
  const packageJsonPath = rootPackageJsonPath;
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Object containing dependencies and devDependencies to be updated
  let dependenciesToUpdate: {
    dependencies: Dependencies;
    devDependencies?: Dependencies;
  } = { dependencies: {}, devDependencies: {} };

  if (additionalDependencies) {
    dependenciesToUpdate.dependencies = {
      ...dependenciesToUpdate.dependencies,
      ...additionalDependencies,
    };
  }
  if (typeof input === 'string' && input === '--all') {
    for (const component in dependenciesConfig) {
      dependenciesToUpdate.dependencies = {
        ...dependenciesToUpdate.dependencies,
        ...dependenciesConfig[component].dependencies,
      };
      if (dependenciesConfig[component].devDependencies) {
        dependenciesToUpdate.devDependencies = {
          ...dependenciesToUpdate.devDependencies,
          ...dependenciesConfig[component].devDependencies,
        };
      }
    }
  } else if (Array.isArray(input)) {
    // If input is an array of component names, update corresponding dependencies
    input.forEach((component) => {
      if (dependenciesConfig[component]) {
        dependenciesToUpdate.dependencies = {
          ...dependenciesToUpdate.dependencies,
          ...dependenciesConfig[component].dependencies,
        };
        if (dependenciesConfig[component].devDependencies) {
          dependenciesToUpdate.devDependencies = {
            ...dependenciesToUpdate.devDependencies,
            ...dependenciesConfig[component].devDependencies,
          };
        }
      } else {
        return;
      }
    });
  }

  // Update package.json with the new dependencies
  packageJson = {
    ...packageJson,
    dependencies: {
      ...packageJson.dependencies,
      ...dependenciesToUpdate.dependencies,
    },
    devDependencies: {
      ...packageJson.devDependencies,
      ...dependenciesToUpdate.devDependencies,
    },
  };

  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
}

const installPackages = async (
  installationMethod: string | undefined
): Promise<void> => {
  let command;
  if (!installationMethod) {
    let versionManager: string | null = findLockFileType();
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
  s.start('⏳ Installing dependencies. This might take a couple of minutes...');

  try {
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

//function to detect type of project
async function detectProjectType(directoryPath: string): Promise<string> {
  try {
    // Check for files or directories unique to Next.js, Expo, or React Native CLI projects
    const nextjsFiles: string[] = ['next.config.js', 'next.config.mjs'];
    const expoFiles: string[] = ['app.json'];
    const reactNativeFiles: string[] = ['ios', 'android'];
    const packageJsonPath = rootPackageJsonPath;
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
    if (fs.existsSync(packageJsonPath)) {
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

async function getComponentStyle() {
  try {
    if (
      fs.existsSync(join(currDir, config.writableComponentsPath)) &&
      fs.existsSync(join(currDir, config.UIconfigPath))
    )
      getExistingComponentStyle();
    if (
      fs.existsSync(join(currDir, config.writableComponentsPath)) &&
      !fs.existsSync(join(currDir, config.UIconfigPath))
    ) {
      const userInput = await text({
        message: `No file found as ${config.configFileName} in components folder, Enter path to your config file in your project, if exist:`,
        validate(value) {
          if (value.length === 0) return `please enter a valid path`;
        },
      });
      config.UIconfigPath = userInput.toString();
      config.configFileName = config.UIconfigPath.split('/').pop() as string;
      if (fs.existsSync(join(currDir, config.UIconfigPath)))
        getExistingComponentStyle();
      else {
        log.error(`\x1b[31mInvalid config path provided\x1b[0m`);
        process.exit(1);
      }
    }
    if (!fs.existsSync(join(currDir, config.writableComponentsPath))) {
      log.warning(
        `\x1b[33mgluestack is not initialized in the project. use 'npx gluestack-ui init' or 'help' to continue.\x1b[0m`
      );
      process.exit(1);
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
}

//function to return additional dependencies based on project type
async function getAdditionalDependencies(
  projectType: string | undefined,
  style: string
) {
  try {
    if (style === config.nativeWindRootPath) {
      if (projectType && projectType !== 'library') {
        return projectBasedDependencies[projectType].dependencies;
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
     \n\x1b[34m${join(currDir, path)}
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

export {
  cloneRepositoryAtRoot,
  getAllComponents,
  installPackages,
  getAdditionalDependencies,
  detectProjectType,
  isValidPath,
  checkWritablePath,
  addDependencies,
  getExistingComponentStyle,
  projectRootPath,
};
