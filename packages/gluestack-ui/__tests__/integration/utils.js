const { execSync, spawnSync, spawn } = require('child_process');
const { promisify } = require('util');

// Utility function to run an Expo project.
// function runNextProject(projectPath) {
//   try {
//     const output = execSync(`yarn dev`, {
//       cwd: projectPath,
//       stdio: 'inherit',
//       shell: true,
//     });
//     console.log(output.toString());
//     return true;
//   } catch (error) {
//     console.error('Error running Next project:', error);
//     return false;
//   }
// }
function startProject(nextAppPath, NEXT_PORT) {
  let nextServerStarted;

  return new Promise(async (resolve, reject) => {
    console.log(`Running: yarn dev --port=${NEXT_PORT}`);
    const appProcess = spawn(`yarn dev --port=${NEXT_PORT}`, {
      cwd: nextAppPath,
      shell: true,
    });
    await promisify(setTimeout)(1000);

    appProcess.stdout.on('data', function(data) {
      console.log(data.toString());
      const match = data.toString().match(/started server/);
      if (match) {
        nextServerStarted = true;
        resolve(appProcess);
      }
    });

    appProcess.on('close', code => {
      //   console.log(`child process close all stdio with code ${code}`);
      resolve();
    });

    appProcess.on('exit', code => {
      //   console.log(`child process exited with code ${code}`);
      resolve();
    });

    appProcess.on('error', function(error) {
      console.log(error);
      reject();
    });

    while (!nextServerStarted) {
      await promisify(setTimeout)(1000);
      console.log('Waiting for server to start');
    }
  });
}

function cleanUpPort(projectPath, NEXT_PORT) {
  try {
    // Kill any processes listening on the NEXT_PORT
    console.log(`Killing processes listening on port ${NEXT_PORT}...`);
    spawnSync(`kill -9 $(lsof -t -i:${NEXT_PORT})`, {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.error('Error occurred during my-next-app setup:');
    console.error(error);
  }
}

function convertToCamelCase(inputString) {
  return inputString.replace(/-([a-z])/g, (_, match) => match.toUpperCase());
}

module.exports = {
  cleanUpPort,
  convertToCamelCase,
  startProject,
};
