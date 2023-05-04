import { exec, spawnSync } from 'child_process';
import { Spinner } from 'cli-spinner';
import fs from 'fs-extra';
import path from 'path';
import finder from 'find-package-json';
import simpleGit from 'simple-git';
import util from 'util';
import prompts from 'prompts';

const stat = util.promisify(fs.stat);

const currDir = process.cwd();

var f = finder(currDir);
const rootPackageJsonPath: string = f.next().filename || '';
const projectRootPath: string = path.dirname(rootPackageJsonPath);

const createFolders = (pathx: string) => {
  const parts = pathx.split('/');
  let currentPath = '';

  try {
    parts.forEach(part => {
      currentPath += part + '/';
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    });
  } catch (error) {
    console.error(
      '\x1b[31m',
      `Error while creating folder ${currentPath}: ${(error as Error).message}`,
      '\x1b[0m'
    );
  }
};

const removeClonedRepo = async (
  sourcePath: string,
  repoName: string
): Promise<void> => {
  try {
    await util.promisify(exec)(`cd ${sourcePath} && rm -rf ${repoName}`);
  } catch (error) {
    console.warn(
      '\x1b[33m',
      `Error while removing cloned repo ${repoName}: ${
        (error as Error).message
      }`,
      '\x1b[0m'
    );
  }
};

const cloneComponentRepo = async (
  targetPath: string,
  gitURL: string
): Promise<void> => {
  const git = simpleGit();
  const spinner = new Spinner('%s Cloning repository... ');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  try {
    await git.clone(gitURL, targetPath);
    spinner.stop(true);
    console.log('\x1b[32m', '\nCloning successful.', '\x1b[0m');
  } catch (error) {
    spinner.stop(true);
    console.error('\x1b[31m', '\nCloning failed', '\x1b[0m');
    console.error(error);
  }
};

const tryGitPull = async (targetPath: string): Promise<void> => {
  const git = simpleGit(targetPath);

  if (fs.existsSync(targetPath)) {
    try {
      await git.pull('origin', 'main');
    } catch (error) {
      console.error(error);
    }
  } else {
    console.error('\x1b[31m', '\nTarget path does not exist', '\x1b[0m');
  }
};

const wait = (msec: number): Promise<void> =>
  new Promise<void>((resolve, _) => {
    setTimeout(resolve, msec);
  });

const pullComponentRepo = async (targetpath: string): Promise<void> => {
  const spinner = new Spinner('%s Pulling latest changes... ');
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  let retry = 0;
  let success = false;
  while (!success && retry < 3) {
    try {
      await wait(1000);
      await tryGitPull(targetpath);
      success = true;
    } catch (error) {
      console.error(
        '\x1b[31m',
        `\nPulling failed - retrying... (Attempt ${retry + 1})\n`,
        '\x1b[0m',
        (error as Error).message
      );
      retry++;
    }
  }
  if (!success) {
    spinner.stop();
    console.error('\x1b[31m', '\nPulling failed!\n', '\x1b[0m');
  } else {
    spinner.stop();
    console.log('\x1b[32m', '\nGit pull successful.', '\x1b[0m');
  }
};

const checkIfFolderExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    console.warn(
      `Error while checking if folder exists: ${(error as Error).message}`
    );
    return false;
  }
};

const detectLockFile = (): string | null => {
  const packageLockPath = path.join(projectRootPath, 'package-lock.json');
  const yarnLockPath = path.join(projectRootPath, 'yarn.lock');
  const pnpmLockPath = path.join(projectRootPath, 'pnpm-lock.yaml');

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

const promptVersionManager = async (): Promise<string> => {
  const response = await prompts({
    type: 'select',
    name: 'value',
    message:
      '\nNo lockfile detected. Please select a package manager to install dependencies:',
    choices: [
      { title: 'npm', value: 'npm' },
      { title: 'yarn', value: 'yarn' },
      // { title: 'pnpm', value: 'pnpm' },
    ],
  });
  return response.value;
};

const installDependencies = async (): Promise<void> => {
  const spinner = new Spinner('%s Installing dependencies... ');
  spinner.setSpinnerString('|/-\\');

  let versionManager: string | null = detectLockFile();
  if (!versionManager) {
    versionManager = await promptVersionManager();
  } else {
    const confirmResponse = await prompts({
      type: 'confirm',
      name: 'value',
      message: `Lockfile detected for ${versionManager}. Continue with ${versionManager} install?`,
      initial: true,
    });
    if (!confirmResponse.value) {
      versionManager = await promptVersionManager();
    }
  }

  let command;
  switch (versionManager) {
    case 'npm':
      command = 'npm install --legacy-peer-deps';
      break;
    case 'yarn':
      command = 'yarn';
      break;
    case 'pnpm':
      command = 'pnpm install';
      break;
    default:
      throw new Error('Invalid package manager selected');
  }

  try {
    spinner.start();
    spawnSync(command, {
      cwd: projectRootPath,
      stdio: 'inherit',
      shell: true,
    });
    spinner.stop();
    console.log(
      '\x1b[32m%s\x1b[0m',
      '\nDependencies have been installed successfully.'
    );
    process.exit();
  } catch (error) {
    console.error('Error installing dependencies.');
    console.error('\x1b[31m%s\x1b[0m', `Error: Run '${command}' manually!`);
    throw new Error('Error installing dependencies.');
  }
};

const getConfigComponentPath = () => {
  const configFile = fs.readFileSync(
    `${currDir}/gluestack-ui.config.ts`,
    'utf-8'
  );
  const match = configFile.match(/componentPath:\s+(['"])(.*?)\1/);

  const componentPath = (match && match[1]) ?? '';

  return componentPath;
};

export {
  createFolders,
  removeClonedRepo,
  cloneComponentRepo,
  pullComponentRepo,
  checkIfFolderExists,
  installDependencies,
  getConfigComponentPath,
};
