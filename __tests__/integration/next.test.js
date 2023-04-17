const { join } = require('path');
const path = require('path');

const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');

const { promisify } = require('util');
const request = require('supertest');

const nextAppRootDirectory = join(__dirname, '../apps');
const nextAppPath = join(__dirname, '../apps/my-next-app');
const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}`;

describe('Next.js App Integration Test', () => {
  let appProcess;
  let initNextAppProcess;
  let nextServerStarted;

  const initGluestack = () => {
    return new Promise((resolve, reject) => {
      const child = spawn('npx -y gluestack-ui@latest init', {
        shell: true,
        cwd: nextAppPath, // Path to your Next.js app directory
        // stdio: 'inherit',
      });

      child.stdout.on('data', function (data) {
        child.stdin.write('\n');
        console.log(data.toString());
      });

      child.stdout.on('close', function () {
        resolve(true);
      });
      child.stdout.on('error', function (error) {
        console.log(error);
        reject();
      });
    });
  };

  const addComponent = () => {
    return new Promise((resolve, reject) => {
      const child = spawn('npx -y gluestack-ui@latest add button', {
        shell: true,
        cwd: nextAppPath, // Path to your Next.js app directory
        // stdio: 'inherit',
      });

      child.stdout.on('data', function (data) {
        child.stdin.write('\n');
        console.log(data.toString());
      });

      child.stdout.on('close', function () {
        resolve(true);
      });
      child.stdout.on('error', function (error) {
        console.log(error);
        reject();
      });
    });
  };

  const updateNextjsConfiguration = () => {
    const documentPath = path.join(nextAppPath, 'src/app/__document.tsx');
    const nextConfig = path.join(nextAppPath, 'next.config.js');

    fs.writeFileSync(
      documentPath,
      `import * as React from "react"
      import { Html, Head, Main, NextScript } from "next/document"
      import { AppRegistry } from "react-native-web"
      import { flush } from "@dank-style/react"
      
      function Document() {
        return (
          <Html lang="en">
            <Head />
            <body>
              <Main />
              <NextScript />
            </body>
          </Html>
        )
      }
      
      Document.getInitialProps = async ({ renderPage }: any) => {
        AppRegistry.registerComponent("Main", () => Main)
        const { getStyleElement } = AppRegistry.getApplication("Main")
        const page = await renderPage()
        const styles = [getStyleElement(), ...flush()]
        return { ...page, styles: React.Children.toArray(styles) }
      }
      
      export default Document`
    );

    fs.writeFileSync(
      nextConfig,
      `const { withGluestackUI } = require("@gluestack/ui-next-adapter")

      const nextConfig = {
        reactStrictMode: true,
        experimental: {
          appDir: true,
        },
      }
    module.exports = withGluestackUI(nextConfig)`
    );
  };

  beforeAll(async () => {
    try {
      // Clean up existing app
      spawnSync(`kill -9 $(lsof -t -i:${NEXT_PORT})`, {
        cwd: nextAppRootDirectory, // Path to your Next.js app directory
        stdio: 'inherit',
        shell: true,
      });
      spawnSync('rm -rf', ['my-next-app'], {
        cwd: nextAppRootDirectory, // Path to your Next.js app directory
        stdio: 'inherit',
        shell: true,
      });

      // Start the Next.js app process

      spawnSync(
        'npx -y create-next-app@latest my-next-app --ts --eslint --src-dir false --experimental-app false --tailwind  --import-alias "@/*"',
        {
          cwd: nextAppRootDirectory, // Path to your Next.js app directory
          stdio: 'inherit',
          shell: true,
        }
      );
    } catch (Error) {
      console.log(Error);
    }
  }, 60000);

  test('Init gluestack: Should exist gluestack-ui.config.ts', async () => {
    try {
      await initGluestack();
      const filePath = path.join(nextAppPath, 'gluestack-ui.config.ts');
      const fileExists = fs.existsSync(filePath);
      expect(fileExists).toBeTruthy();
    } catch (Error) {
      console.log(Error);
    }
  }, 70000);

  test('Init gluestack: Should exist components folder', () => {
    const filePath = path.join(nextAppPath, 'components');

    console.log(filePath, 'component file path');
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);
  });

  test('Update configuration: Should exist __document.tsx', async () => {
    await updateNextjsConfiguration();

    const filePath = path.join(nextAppPath, 'src/app/__document.tsx');
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);
  }, 30000);

  test('Add component: Should exist button folder ', async () => {
    await addComponent();

    const filePath = path.join(nextAppPath, 'components/core/Button');
    const fileExists = fs.existsSync(filePath);
    expect(fileExists).toBe(true);

    // const filePath = path.join(nextAppPath, 'components');
    // const fileExists = fs.existsSync(filePath);
    // expect(fileExists).toBe(true);
  }, 30000);

  test('Start Next.js app: Should render next app', async () => {
    appProcess = spawn(`yarn dev --port=${NEXT_PORT}`, {
      cwd: nextAppPath, // Path to your Next.js app directory
      // stdio: 'inherit',
      //
      shell: true,
    });

    const regex = /started server/;
    // while (!appUrl) {
    const output = await promisify(setTimeout)(1000);

    appProcess.stdout.on('data', function (data) {
      //Here is where the output goes

      const match = data.toString().match(regex);
      if (match) {
        nextServerStarted = true;
      }
    });

    while (!nextServerStarted) {
      const output = await promisify(setTimeout)(1000);
      console.log('Waiting for server to start');
    }
    // Send a GET request to the app URL
    const response = await request(nextAppUrl).get('/');
    //   // Verify that the response contains a component with text
    expect(response.text).toMatch(/Get started by editing/);
  }, 30000);

  // test('Usage button component: Should render button component', () => {
  //   expect(false).toMatch(true);
  // },);

  afterAll(() => {
    if (appProcess) {
      appProcess.kill();
    }
    // Stop the app process
    spawnSync('rm -rf', ['my-next-app'], {
      cwd: nextAppRootDirectory, // Path to your Next.js app directory
      stdio: 'inherit',
      shell: true,
    });
  });
});
