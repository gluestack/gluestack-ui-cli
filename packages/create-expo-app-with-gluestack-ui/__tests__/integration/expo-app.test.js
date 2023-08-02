const fs = require('fs');
const path = require('path');
// const request = require('supertest');
const { join } = require('path');
const {
  cleanUpPort,
  startProject,
  createProject,
  cleanAppDirectory,
} = require('./utils');

const APP_NAME = `my-expo-app`;
const expoAppRootDirectory = join(__dirname, '../apps');
const expoAppPath = join(__dirname, '../apps', APP_NAME);

const EXPO_PORT = '3039';
// const expoAppUrl = `http://localhost:19006/`;

const isProduction = process.argv.includes('--isProduction=true');

describe('Create Expo app:', () => {
  let appProcess;
  beforeAll(async () => {
    cleanUpPort(expoAppRootDirectory, EXPO_PORT);
    cleanAppDirectory(expoAppRootDirectory, APP_NAME);
  }, 200000);

  it('Create a Expo app with npx', async () => {
    await createProject(expoAppRootDirectory, APP_NAME, isProduction);
    const appPath = path.join(expoAppRootDirectory, APP_NAME);
    expect(fs.existsSync(appPath)).toBe(true);
    expect(fs.existsSync(appPath + "/node_modules")).toBe(true);
  }, 5000000);

  // it('Start and check if Expo app is running', async () => {
  //   if (fs.existsSync(expoAppPath)) {
  //     appProcess = await startProject(expoAppPath, EXPO_PORT);
  //     const response = await request(expoAppUrl).get('/');
  //     const responseBody = response.text;
  //     expect(responseBody.includes('Get started by editing')).toBe(true);
  //   }
  // }, 5000000);

  afterAll(() => {
    // cleanUpPort(expoAppRootDirectory, EXPO_PORT);
    cleanAppDirectory(expoAppRootDirectory, APP_NAME);
    if (appProcess) {
      appProcess.kill();
    }
  });
});
