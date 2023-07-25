const fs = require('fs');
const path = require('path');
const request = require('supertest');

const { startProject, cleanUpPort, convertToCamelCase } = require('./utils');
const { spawnSync } = require('child_process');

const APP_NAME = `my-next-app`;
const nextAppRootDirectory = path.join(__dirname, '../apps');
const projectPath = path.join(__dirname, '../apps', APP_NAME);

const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}/`;

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

describe('Next Project', () => {
  let appProcess;

  beforeAll(() => {
    cleanUpPort(projectPath, NEXT_PORT);
  });

  for (const component of componentArray) {
    it(`npx gluestack-ui@latest remove ${component}`, () => {
      // Your test logic here
      console.log(`yarn dev remove ${component}`);
      spawnSync(
        `node ../../../dist/index.js remove ${component} --use-npm --force-update`,
        {
          cwd: projectPath,
          stdio: 'inherit',
          shell: true,
        }
      );
      const componentFolder = convertToCamelCase(component);
      expect(
        fs.existsSync(projectPath + '/components/core/' + componentFolder)
      ).toBe(true);
    });

    it('should run the Next project', async () => {
      if (fs.existsSync(projectPath)) {
        appProcess = await startProject(projectPath, NEXT_PORT);
        const response = await request(nextAppUrl).get('/');
        const responseBody = response.text;
        expect(responseBody.includes('Get started by editing')).toBe(true);
      }

      cleanUpPort(nextAppRootDirectory, NEXT_PORT);
    }, 50000);
  }

  afterAll(() => {
    // Clean up any resources or files after all tests are finished.
    cleanUpPort(nextAppRootDirectory, NEXT_PORT);
    if (appProcess) {
      appProcess.kill();
    }
  });
});
