const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { join } = require('path');
const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
const { promisify } = require('util');


const APP_NAME = `my-app`;
const nextAppRootDirectory = join(__dirname, '../apps');
const nextAppPath = join(__dirname, '../apps', APP_NAME);

const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}`;

describe('Next.js Command: npx create-next-app-with-gluestack-ui@latest', () => {
  let appProcess;
  let nextServerStarted;

  beforeAll(async () => {
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
  }, 200000);


  const createProject = () => {
    return new Promise((resolve, reject) => {

      const child = spawn(
        `npx create-next-app-with-gluestack-ui@latest ${APP_NAME} --page`, {
         cwd: nextAppRootDirectory,
          shell: true,
        }
      );


      child.stdout.on('data',async function(data) {
        console.log(data.toString());
        child.stdin.write("\n");
      });
  
      child.on('close', code => {
        console.log(`child process close all stdio with code ${code}`);
        resolve();
      });
  
      child.on('exit', code => {
        console.log(`child process exited with code ${code}`);
        resolve();
      });
  
      child.on('error', function(error) {
        console.log(error);
        reject();
      });

    });
  };

  it('Create a next repo in the home directory', async() => {
     // Remove any existing my-next-app directory
     console.log('Removing any existing my-app directory...');
     spawnSync('rm -rf', [APP_NAME], {
       cwd: nextAppRootDirectory,
       stdio: 'inherit',
       shell: true,
     });

      // Clone the my-next-app Git repository
      console.log('create app using cli...', nextAppRootDirectory);
      await createProject();

      const appPath = path.join(nextAppRootDirectory, APP_NAME)
      expect(fs.existsSync(appPath)).toBe(true);
      console.log('✅️  project folder is created');

  }, 200000);



  it('Start and check if next js project is running', async () => {
    appProcess = spawn(`yarn dev --port=${NEXT_PORT}`, {
      cwd: nextAppPath,
      shell: true,
    });
    await promisify(setTimeout)(1000);
    appProcess.stdout.on('data', function(data) {
      console.log(data.toString());
      const match = data.toString().match(/started server/);
      if (match) {
        nextServerStarted = true;
      }
    });

    appProcess.on('close', code => {
      console.log(`child process close all stdio with code ${code}`);
    });

    appProcess.on('exit', code => {
      console.log(`child process exited with code ${code}`);
    });

    appProcess.on('error', function(error) {
      console.log(error);
    });


    while (!nextServerStarted) {
      await promisify(setTimeout)(1000);
      console.log('Waiting for server to start');
    }
    const response = await request(nextAppUrl).get('/');
    const responseBody = response.text;
    expect(responseBody.includes('Get started by editing')).toBe(true);
  }, 50000);



  afterAll(() => {
    if (appProcess) {
      appProcess.kill();
    }
    spawnSync('rm -rf', [APP_NAME], {
      cwd: nextAppRootDirectory,
      stdio: 'inherit',
      shell: true,
    });
  });
});
