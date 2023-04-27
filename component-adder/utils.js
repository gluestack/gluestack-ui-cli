const { exec, spawnSync } = require('child_process');
const fs = require('fs-extra');
const util = require('util');
const stat = util.promisify(fs.stat);
const path = require('path');
const Spinner = require('cli-spinner').Spinner;

var spawn = require('child_process').spawn;

const homeDir = require('os').homedir();

var finder = require('find-package-json');
const currDir = process.cwd();
var f = finder(currDir);
const rootPackageJsonPath = f.next().filename;

const projectRootPath = path.dirname(rootPackageJsonPath);


const createFolders = (pathx) => {
  const parts = pathx.split('/');
  let currentPath = '';

  parts.forEach((part) => {
    currentPath += part + '/';
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
};

const removeClonedRepo = async (sourcePath, repoName) => {
  await exec(
    `cd ${sourcePath} && rm -rf ${repoName}`,
    (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
    }
  );
};

const cloneComponentRepo = async (targetpath, gitURL) => {
  const git = require('simple-git')();
  const spinner = new Spinner('%s Cloning repository... ');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  await git
    .outputHandler((stdout, stderr) => {
      // stdout.pipe(process.stdout);
      // stderr.pipe(process.stderr);
    })
    .clone(gitURL, targetpath, [], (err) => {
      if (err) {
        spinner.stop(true);
        console.error('\x1b[31m', '\nCloning failed', '\x1b[0m');
        // callback(err);
      } else {
        spinner.stop(true);
        console.log('\x1b[32m', '\nCloning successful.', '\x1b[0m');
        // callback();
      }
    });
};

async function tryGitPull(targetPath) {
  const git = require('simple-git')(targetPath);

  if (fs.existsSync(targetPath)) {
    await git.pull('origin', 'main');
  }
}

const wait = (msec) =>
  new Promise((resolve, _) => {
    setTimeout(resolve, msec);
  });

const pullComponentRepo = async (targetpath) => {
  const spinner = new Spinner('%s Pulling changes... ');
  spinner.setSpinnerString('|/-\\');
  spinner.start();
  let retry = 0;
  let success = false;
  while (!success && retry < 3) {
    try {
      await wait(1000);
      await tryGitPull(targetpath);
      success = true;
    } catch (err) {
      console.error('\x1b[31m', '\nPulling failed - retring\n', '\x1b[0m', err);
      retry++;
    }
  }
  if (!success) {
    spinner.stop();
    console.error('\x1b[31m', '\nPulling failed!\n', '\x1b[0m');
  } else {
    spinner.stop();
    console.log('\x1b[32m', '\nPull successful.\n', '\x1b[0m');
  }
};

const checkIfFolderExits = async (path) => {
  try {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
};

const installDependencies = (currDir) => {
  const spinner = new Spinner('%s Installing dependencies... ');
  spinner.setSpinnerString('|/-\\');
  let command = 'yarn';

  try {
    spinner.start();
    let ls;

    if (fs.existsSync(path.join(projectRootPath, 'package-lock.json'))) {
      ls = spawnSync('npm', ['install', '--legacy-peer-deps'], {
        cwd: projectRootPath,
        stdio: 'inherit',
      });
      command = 'npm install';
    } else {
      ls = spawnSync('yarn', {
        cwd: projectRootPath,
        stdio: 'inherit',
      });
    }
    spinner.stop();
    console.log('\nDependencies have been installed successfully.');
  } catch (Error) {
    //
    console.error('Error installing dependencies.');
    console.error('\x1b[31m%s\x1b[0m', `Error: Run '${command}' manually!`);
    reject(new Error('Error installing dependencies.'));
  }
};

module.exports = {
  createFolders,
  removeClonedRepo,
  cloneComponentRepo,
  pullComponentRepo,
  checkIfFolderExits,
  installDependencies,
};
