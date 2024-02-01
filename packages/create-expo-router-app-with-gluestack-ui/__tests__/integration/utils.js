const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
const { promisify } = require('util');
const path = require('path');

function cleanAppDirectory(expoAppRootDirectory, APP_NAME) {
  spawnSync('rm -rf', [APP_NAME], {
    cwd: expoAppRootDirectory,
    stdio: 'inherit',
    shell: true,
  });
}

function createProject(
  expoAppRootDirectory,
  APP_NAME,
  isProduction = false
) {
  console.log(`Removing any existing ${APP_NAME} directory...`);
  cleanAppDirectory(expoAppRootDirectory, APP_NAME);

  const createrCommand = isProduction
    ? `npx create-expo-app-with-gluestack-ui@latest` + ` ${APP_NAME}`
    : 'yarn dev ' +
      path.join('./', path.relative('./', expoAppRootDirectory), APP_NAME);


  return new Promise((resolve, reject) => {
    const child = spawn(createrCommand, {
      cwd: expoAppRootDirectory,
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

function startProject(expoAppPath, EXPO_PORT) {
  let expoServerStarted;

  return new Promise(async (resolve, reject) => {
    const appProcess = spawn(`yarn web --port=${EXPO_PORT}`, {
      cwd: expoAppPath,
      shell: true,
    });
    await promisify(setTimeout)(10000);

    appProcess.stdout.on('data', function (data) {
      console.log(data.toString());
      const match = data.toString().match(/Starting Webpack on port 19006 in development mode/);
      if (match) {
        expoServerStarted = true;
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

    while (!expoServerStarted) {
      await promisify(setTimeout)(10000);
      console.log('Waiting for server to start');
    }
  });
}

function cleanUpPort(expoAppRootDirectory, EXPO_PORT) {
  try {
    // Kill any processes listening on the EXPO_PORT
    console.log(`Killing processes listening on port ${EXPO_PORT}...`);
    spawnSync(`kill -9 $(lsof -t -i:${EXPO_PORT})`, {
      cwd: expoAppRootDirectory,
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.error('Error occurred during my-expo-app setup:');
    console.error(error);
  }
}

module.exports = {
  cleanAppDirectory: cleanAppDirectory,
  createProject: createProject,
  startProject: startProject,
  cleanUpPort: cleanUpPort,
};
