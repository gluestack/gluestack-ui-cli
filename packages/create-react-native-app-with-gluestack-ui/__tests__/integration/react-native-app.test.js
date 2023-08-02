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

const APP_NAME = `my-rn-app`;
const rnAppRootDirectory = join(__dirname, '../apps');
const rnAppPath = join(__dirname, '../apps', APP_NAME);

const RN_PORT = '3039';
// const rnAppUrl = `http://localhost:19006/`;

const isProduction = process.argv.includes('--isProduction=true');

describe('Create React Native app:', () => {
  let appProcess;
  beforeAll(async () => {
    cleanUpPort(rnAppRootDirectory, RN_PORT);
    cleanAppDirectory(rnAppRootDirectory, APP_NAME);
  }, 200000);

  it('Create a React Native app with npx', async () => {
    await createProject(rnAppRootDirectory, APP_NAME, isProduction);
    const appPath = path.join(rnAppRootDirectory, APP_NAME);
    expect(fs.existsSync(appPath)).toBe(true);
    expect(fs.existsSync(appPath + '/node_modules')).toBe(true);
  }, 5000000);

  // it('Start and check if React Native app is running', async () => {
  // if (fs.existsSync(rnAppPath)) {
  // appProcess = await startProject(rnAppPath, RN_PORT);
  // const response = await request(rnAppUrl).get('/');
  // const responseBody = response.text;
  // expect(responseBody.includes('Get started by editing')).toBe(true);
  // }
  // }, 5000000);

  afterAll(() => {
    // cleanUpPort(rnAppRootDirectory, RN_PORT);
    cleanAppDirectory(rnAppRootDirectory, APP_NAME);
    if (appProcess) {
      appProcess.kill();
    }
  });
});
