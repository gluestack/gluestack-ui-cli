const { join } = require('path');
const path = require('path');

const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');

const { promisify } = require('util');
// const request = require('supertest');


const nextAppRootDirectory = join(__dirname, '../apps');
const nextAppPath = join(__dirname, '../apps/my-next-app');
describe('Next.js App Integration Test', () => {
  let appProcess;
  let initNextAppProcess;

  let appUrl;


  const initGluestack = () => {
    return new Promise((resolve, reject) => {
      const child = spawn('npx -y gluestack-ui@latest init', {
        shell: true,
        cwd: nextAppPath, // Path to your Next.js app directory
        // stdio: 'inherit',
      });

      child.stdout.on('data', function (data) {
        child.stdin.write('\n');
      });


      child.stdout.on('close', function () {
        resolve(true);
      });
      child.stdout.on('error', function () {
        reject();
      });
    });
  }

  const addComponent = () => {
    return new Promise((resolve, reject) => {
      const child = spawn('npx -y gluestack-ui@latest add button', {
        shell: true,
        cwd: nextAppPath, // Path to your Next.js app directory
        // stdio: 'inherit',
      });

      child.stdout.on('data', function (data) {
        child.stdin.write('\n');
      });


      child.stdout.on('close', function () {
        resolve(true);
      });
      child.stdout.on('error', function () {
        reject();
      });
    });
  }

  beforeAll(async () => {
    // Clean up existing app
    spawnSync('rm -rf', ['my-next-app'], {
      cwd: nextAppRootDirectory, // Path to your Next.js app directory
      stdio: 'inherit',
      shell: true,
    })
    // Start the Next.js app process

    spawnSync('npx -y create-next-app@latest my-next-app --ts --eslint --src-dir false --experimental-app false  --import-alias "@/*"', {
      cwd: nextAppRootDirectory, // Path to your Next.js app directory
      stdio: 'inherit',
      shell: true,
    });


    await initGluestack();
    console.log('hello world')
    // init gluestack uit 


  }, 60000);


  test('Should render a component', async () => {
    // Send a GET request to the app URL
    // const response = await request(appUrl).get('/');
    // // Verify that the response contains a component with a specific class
    // expect(response.text).toMatch(/<div class="my-component">/);
  });

  test('Should exist gluestack-ui.config.ts', () => {
    const filePath = path.join(nextAppPath, 'gluestack-ui.config.ts');
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);
  });



  test('Should exist components folder', () => {
    const filePath = path.join(nextAppPath, 'components');
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);
  });

  test('Add component ', async () => {

    await addComponent();

    const filePath = path.join(nextAppPath, 'components/core/button');
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);

    // const filePath = path.join(nextAppPath, 'components');
    // const fileExists = fs.existsSync(filePath);
    // expect(fileExists).toBe(true);
  }, 30000);

  // test('Should exist components', () => {
  //   const filePath = 'data/example.txt';
  //   const fileExists = fs.existsSync(filePath);
  //   expect(fileExists).toBe(true);
  // });


  afterAll(() => {
    // Stop the app process
    spawnSync('rm -rf', ['my-next-app'], {
      cwd: nextAppRootDirectory, // Path to your Next.js app directory
      stdio: 'inherit',
      shell: true,
    })
  });


});