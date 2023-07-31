const fs = require('fs');
const path = require('path');
const request = require('supertest');

const data = require('../apps/my-next-app/package.json');

const { startProject, cleanUpPort, convertToCamelCase } = require('./utils');
const { spawnSync } = require('child_process');

const APP_NAME = `my-next-app`;
const nextAppRootDirectory = path.join(__dirname, '../apps');
const projectPath = path.join(__dirname, '../apps', APP_NAME);

const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}`;

const isProduction = process.argv.includes('--isProduction=true');

const componentArray = [
  'actionsheet',
  'alert',
  'alert-dialog',
  'avatar',
  'badge',
  'box',
  'button',
  'center',
  'checkbox',
  'divider',
  'fab',
  'form-control',
  'heading',
  'hstack',
  'icons',
  'image',
  'input',
  'link',
  'menu',
  'modal',
  'popover',
  'pressable',
  'progress',
  'radio',
  'select',
  'slider',
  'spinner',
  'switch',
  'text',
  'textarea',
  'toast',
  'tooltip',
  'vstack',
];

describe('Next Project -> Add', () => {
  let appProcess;

  beforeAll(() => {
    cleanUpPort(projectPath, NEXT_PORT);
  });

  for (const component of componentArray) {
    it(`Add ${component}`, () => {
      if(isProduction) {
        spawnSync(
          `npx gluestack-ui add ${component} --use-npm --force`,
          {
            cwd: projectPath,
            stdio: 'inherit',
            shell: true,
          }
        );
      } else {
        spawnSync(
          `node ../../../dist/index.js add ${component} --use-npm --force`,
          {
            cwd: projectPath,
            stdio: 'inherit',
            shell: true,
          }
        );
      }

      // TODO:  export * from ... is there or not.
      // check if in node_modules or not i.e. dependancies list check
    });

    it(`Adds the ${component} folder in core`, () => {
      const componentFolder = convertToCamelCase(component);
      expect(
        fs.existsSync(projectPath + '/components/core/' + componentFolder)
      ).toBe(true);
    });

    it(`Adds the ${component} in package.json dependancies`, () => {
      expect(data.dependencies[`@gluestack-ui/${component}`]).toBe("latest");
    });

  }
  // only once after all the components are added
  it('should run the Next project', async () => {
    if (fs.existsSync(projectPath)) {
      appProcess = await startProject(projectPath, NEXT_PORT);
      const response = await request(nextAppUrl).get('/');
      const responseBody = response.text;
      expect(responseBody.includes('Get started by editing')).toBe(true);
    }

    // appProcess.kill('SIGINT');
    // while (appProcess) {
    //   appProcess.kill('SIGKILL');
    // }

    // cleanUpPort(nextAppRootDirectory, NEXT_PORT);

    //TODO: check if all the components renders or not

  }, 50000);

  afterAll(() => {
    if (appProcess) {
      appProcess.kill();
    }
    // Clean up any resources or files after all tests are finished.
    // cleanUpPort(nextAppRootDirectory, NEXT_PORT);
  });

});
