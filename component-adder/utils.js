const Spinner = require('cli-spinner').Spinner;
const { exec } = require('child_process');
const fs = require('fs-extra');
const util = require('util');
const stat = util.promisify(fs.stat);
var spawn = require('child_process').spawn;

const homeDir = require('os').homedir();

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

  const callback = () => {
    console.log('DONE!');
  };

  // await removeClonedRepo(`${homeDir}/.gluestack/cache`, 'ui');

  const spinner = new Spinner('Cloning repository... %s');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  await git
    .outputHandler((command, stdout, stderr) => {
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);

      stdout.on('data', (data) => {
        console.log(data.toString('utf8'));
      });
    })
    .clone(gitURL, targetpath, [], (err) => {
      if (err) {
        spinner.stop(true);
        console.error('Cloning failed');
        callback(err);
      } else {
        spinner.stop(true);
        console.log('Cloning successful');
        callback();
      }
    });
};

const pullComponentRepo = async (targetpath) => {
  const git = require('simple-git')(targetpath);

  const spinner = new Spinner('Pulling changes... %s');
  spinner.setSpinnerString('|/-\\');
  spinner.start();

  try {
    await git.pull();
    spinner.stop();
    console.log('Changes pulled successfully.');
  } catch (err) {
    spinner.stop();
    throw err;
  }
};

const checkIfFolderExits = async (path) => {
  try {
    const stats = await stat(path);
    if (stats.isDirectory()) {
      console.log(`The folder exists.`);
      return true;
    } else {
      console.log(`Is not a folder.`);
      return false;
    }
  } catch (err) {
    console.log(`The folder does not exist.`);
    return false;
  }
};

const yarnInstall = async () => {
  var ls = spawn('yarn');

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  ls.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
  });
};

module.exports = {
  createFolders,
  removeClonedRepo,
  cloneComponentRepo,
  pullComponentRepo,
  checkIfFolderExits,
  yarnInstall,
};
