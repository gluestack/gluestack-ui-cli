const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { join } = require('path');
const {
  cleanUpPort,
  startProject,
  createProject,
  cleanAppDirectory,
} = require('./utils');

const APP_NAME = `my-app-with-app-router`;
const nextAppRootDirectory = join(__dirname, '../apps');
const nextAppPath = join(__dirname, '../apps', APP_NAME);
const options = '--app';

const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}`;

describe('Create Next.js app with app router:', () => {
  let appProcess;

  beforeAll(async () => {
    cleanUpPort(nextAppRootDirectory, NEXT_PORT);
  }, 200000);

  it('Create a Next.js app with npx', async () => {
    await createProject(nextAppRootDirectory, APP_NAME, options);
    const appPath = path.join(nextAppRootDirectory, APP_NAME);
    expect(fs.existsSync(appPath)).toBe(true);
    console.log('✅️  project folder is created');
  }, 200000);

  it('Start and check if Next.js app is running', async () => {
    appProcess = await startProject(nextAppPath, NEXT_PORT);
    const response = await request(nextAppUrl).get('/');
    const responseBody = response.text;
    expect(responseBody.includes('Get started by editing')).toBe(true);
  }, 50000);

  afterAll(() => {
    cleanAppDirectory(nextAppRootDirectory, APP_NAME);
    if (appProcess) {
      appProcess.kill();
    }
  });
});
