const { exec } = require("child_process");
const fs = require("fs-extra");
const util = require("util");
const stat = util.promisify(fs.stat);
const path = require("path");
const Spinner = require("cli-spinner").Spinner;

var spawn = require("child_process").spawn;

const homeDir = require("os").homedir();

const createFolders = (pathx) => {
  const parts = pathx.split("/");
  let currentPath = "";

  parts.forEach((part) => {
    currentPath += part + "/";
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
  const git = require("simple-git")();
  const spinner = new Spinner("%s Cloning repository... ");
  spinner.setSpinnerString("|/-\\");
  spinner.start();

  await git
    .outputHandler((stdout, stderr) => {
      // stdout.pipe(process.stdout);
      // stderr.pipe(process.stderr);
    })
    .clone(gitURL, targetpath, [], (err) => {
      if (err) {
        spinner.stop(true);
        console.error("\x1b[31m", "\nCloning failed", "\x1b[0m");
        // callback(err);
      } else {
        spinner.stop(true);
        console.log("\x1b[32m", "\nCloning successful.", "\x1b[0m");
        // callback();
      }
    });
};

const pullComponentRepo = async (targetpath) => {
  const git = require("simple-git")(targetpath);

  const spinner = new Spinner("%s Pulling changes... ");
  spinner.setSpinnerString("|/-\\");
  spinner.start();

  try {
    await git.pull();
    spinner.stop();
    console.log("\x1b[32m", "\nChanges pulled successful.", "\x1b[0m");
  } catch (err) {
    spinner.stop();
    console.error("\x1b[31m", "\nFailed to pull the changes.", "\x1b[0m");
    throw err;
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

const installDependencies = async (currDir) => {
  const spinner = new Spinner("%s Installing dependencies... ");
  spinner.setSpinnerString("|/-\\");

  let command = "yarn";

  let ls = spawn("yarn");

  if (fs.existsSync(path.join(currDir, "package-lock.json"))) {
    ls = spawn("npm", ["install"]);
    command = "npm install";
  }

  spinner.start();

  return new Promise((resolve, reject) => {
    ls.on("exit", function (code) {
      spinner.stop();

      if (code === 0) {
        console.log("Dependencies installed successfully.");
        resolve();
      } else {
        console.error("Error installing dependencies.");
        console.error("\x1b[31m%s\x1b[0m", `Error: Run '${command}' manually!`);
        reject(new Error("Error installing dependencies."));
      }
    });
  });
};

module.exports = {
  createFolders,
  removeClonedRepo,
  cloneComponentRepo,
  pullComponentRepo,
  checkIfFolderExits,
  installDependencies,
};
