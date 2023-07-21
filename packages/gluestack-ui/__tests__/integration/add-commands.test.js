const fs = require('fs');
const path = require('path');
const { runNextProject, cleanUpPort } = require('./utils');
const { spawnSync } = require('child_process');

const APP_NAME = `my-next-app`;
const nextAppRootDirectory = path.join(__dirname, '../apps');
const projectPath = path.join(__dirname, '../apps', APP_NAME);

const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}/`;

const componentArray = ['Button'];

describe('Next Project', () => {
  let appProcess;

  beforeAll(() => {
    cleanUpPort(projectPath, NEXT_PORT);
  });

  it('hello', () => {
    expect(2 === 2).toBe(true);
  });

  for (const component of componentArray) {
    it(`npx gluestack-ui@latest add ${component}`, () => {
      // Your test logic here
      console.log(`yarn dev add ${component}`, projectPath);
      spawnSync(`node ../../../dist/index.js add ${component}`, {
        cwd: projectPath,
        stdio: 'inherit',
        shell: true,
      });
      // expect(fs.existsSync(projectPath + '/components/core/' + component)).toBe(
      //   true
      // );
    });

    // it('should run the Next project', () => {
    //   const runSuccessful = runNextProject(projectPath);
    //   expect(runSuccessful).toBe(true);
    // });
  }

  afterAll(() => {
    // Clean up any resources or files after all tests are finished.
    cleanUpPort(nextAppRootDirectory, NEXT_PORT);
    if (appProcess) {
      appProcess.kill();
    }
  });
});
