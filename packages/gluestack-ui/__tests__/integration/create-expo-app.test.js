const fs = require('fs');
const path = require('path');
const {
  createExpoProject,
  runExpoProject,
  deleteDirectory,
} = require('./utils');

const APP_NAME = `my-expo-app`;
const expoAppRootDirectory = join(__dirname, '../apps');
const expoAppPath = join(__dirname, '../apps', APP_NAME);

const EXPO_PORT = '3039';
const expoAppUrl = `http://localhost:${EXPO_PORT}/`;

describe('Expo Project', () => {
  let projectPath;

  beforeAll(() => {
    // Run any setup code if needed before each test.
  });

  afterAll(() => {
    // Clean up any resources or files after all tests are finished.
  });

  beforeEach(() => {
    // Create a fresh Expo project before each test.
    projectPath = path.join(__dirname, '../apps'); // Set your desired path here.
    createExpoProject(projectPath);
  });

  afterEach(() => {
    // Clean up the created project after each test.
    deleteDirectory(projectPath);
  });

  it('should create an Expo project in the "../apps" path', () => {
    // Assert that the project was created successfully in the "../apps" path.
    expect(fs.existsSync(projectPath)).toBe(true);
  });

  it('should run the Expo project', () => {
    // Run the Expo project using the `runExpoProject` function.
    // This function may need to start the Expo development server, build the project, etc.
    const runSuccessful = runExpoProject(projectPath);
    expect(runSuccessful).toBe(true);
  });
});
