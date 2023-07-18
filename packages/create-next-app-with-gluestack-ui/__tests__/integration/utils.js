const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
const { promisify } = require('util');
const path = require("path");
function cleanAppDirectory(nextAppRootDirectory, APP_NAME) {
  spawnSync('rm -rf', [APP_NAME], {
    cwd: nextAppRootDirectory,
    stdio: 'inherit',
    shell: true,
  });
}
function createProject(
  nextAppRootDirectory,
  APP_NAME,
  options,
  isProduction = false
) {
  console.log(`Removing any existing ${APP_NAME} directory...`);
  cleanAppDirectory(nextAppRootDirectory, APP_NAME);
  // Clone the my-next-app Git repository

  const createrCommand = isProduction
    ? `npx create-next-app-with-gluestack-ui@latest` + ` ${APP_NAME}`
    : 'yarn dev ' + path.join("./", path.relative( './', nextAppRootDirectory), APP_NAME);

  return new Promise((resolve, reject) => {
    const child = spawn(`${createrCommand} ${options}`, {
      cwd: nextAppRootDirectory,
      shell: true,
    });

    child.stdout.on('data', async function (data) {
      console.log(data.toString());
      child.stdin.write('\n');
    });

    child.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
      resolve();
    });

    child.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve();
    });

    child.on('error', function (error) {
      console.log(error);
      reject();
    });
  });
}

function startProject(nextAppPath, NEXT_PORT) {
  let nextServerStarted;

  return new Promise(async (resolve, reject) => {
    const appProcess = spawn(`yarn dev --port=${NEXT_PORT}`, {
      cwd: nextAppPath,
      shell: true,
    });
    await promisify(setTimeout)(1000);

    appProcess.stdout.on('data', function (data) {
      console.log(data.toString());
      const match = data.toString().match(/started server/);
      if (match) {
        nextServerStarted = true;
        resolve(appProcess);
      }
    });

    appProcess.on('close', (code) => {
      //   console.log(`child process close all stdio with code ${code}`);
      resolve();
    });

    appProcess.on('exit', (code) => {
      //   console.log(`child process exited with code ${code}`);
      resolve();
    });

    appProcess.on('error', function (error) {
      console.log(error);
      reject();
    });

    while (!nextServerStarted) {
      await promisify(setTimeout)(1000);
      console.log('Waiting for server to start');
    }
  });
}

function cleanUpPort(nextAppRootDirectory, NEXT_PORT) {
  try {
    // Kill any processes listening on the NEXT_PORT
    console.log(`Killing processes listening on port ${NEXT_PORT}...`);
    spawnSync(`kill -9 $(lsof -t -i:${NEXT_PORT})`, {
      cwd: nextAppRootDirectory,
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.error('Error occurred during my-next-app setup:');
    console.error(error);
  }
}

module.exports = {
  cleanAppDirectory: cleanAppDirectory,
  createProject: createProject,
  startProject: startProject,
  cleanUpPort: cleanUpPort,
};
