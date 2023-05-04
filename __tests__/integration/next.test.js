const { join } = require('path');
const path = require('path');
const { spawnSync } = require('child_process');
const { spawn } = require('child_process');
const fs = require('fs');
const { promisify } = require('util');
const request = require('supertest');
const { getDataFiles } = require('../../dist/installer/next/data');

const nextAppRootDirectory = join(__dirname, '../apps');
const nextAppPath = join(__dirname, '../apps/my-next-app');
const NEXT_PORT = '3039';
const nextAppUrl = `http://localhost:${NEXT_PORT}`;

const initGluestack = () => {
  return new Promise((resolve, reject) => {
    const child = spawn('node ../../../dist/index.js init', {
      shell: true,
      cwd: nextAppPath,
    });

    child.stdout.on('data', function(data) {
      child.stdin.write('\n');
      console.log(data.toString());
    });

    child.stdout.on('close', function() {
      resolve(true);
    });

    child.stdout.on('error', function(error) {
      console.log(error);
      reject();
    });
  });
};

const checkGluestackConfig = () => {
  const filePath = path.join(nextAppPath, 'gluestack-ui.config.ts');
  return fs.existsSync(filePath);
};

const getConfigComponentPath = () => {
  const configFile = fs.readFileSync(
    `${nextAppPath}/gluestack-ui.config.ts`,
    'utf-8'
  );
  const match = configFile.match(/componentPath:\s+(['"])(.*?)\1/);

  const componentPath = (match && match[2]) ?? '';

  return componentPath;
};

describe('Next.js App Integration Test', () => {
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

      // Remove any existing my-next-app directory
      console.log('Removing any existing my-next-app directory...');
      spawnSync('rm -rf', ['my-next-app'], {
        cwd: nextAppRootDirectory,
        stdio: 'inherit',
        shell: true,
      });

      // Clone the my-next-app Git repository
      console.log('Cloning my-next-app repository...');
      spawnSync(
        'git',
        ['clone', 'https://github.com/mayank-96/my-next-app.git'],
        {
          cwd: nextAppRootDirectory,
        }
      );

      // Install dependencies using npm or yarn
      console.log('Installing dependencies using npm...');
      spawnSync('npm', ['install'], {
        cwd: `${nextAppRootDirectory}/my-next-app`,
        stdio: 'inherit',
        shell: true,
      });
      console.log('my-next-app setup completed successfully');

      // Alternatively, you can use yarn to install dependencies:
      // console.log('Installing dependencies using yarn...');
      // const installResult = spawnSync('yarn', [], {
      //   cwd: `${nextAppRootDirectory}/my-next-app`,
      //   stdio: 'inherit',
      //   shell: true,
      // });
      // if (installResult.status !== 0) {
      //   console.error('Failed to install dependencies using yarn');
      //   console.error(installResult.stderr.toString());
      //   return;
      // }

      // Runs "npx gluestack-ui@latest init"
      await initGluestack();
      console.log('gluestack-ui init setup completed successfully');
      
    } catch (error) {
      console.error('Error occurred during my-next-app setup:');
      console.error(error);
    }
  }, 200000);

  test('Command: npx gluestack-ui@latest init', () => {
    // Check weather gluestack-ui repo is present in home dir
    const homeDir = os.homedir();
    const repoPath = path.join(homeDir, '.gluestack/cache/gluestack-ui');
    const isRepoExists = fs.existsSync(repoPath);
    expect(isRepoExists).toBe(true);

    // Checks weather gluestack-ui.config is added or not
    const gluestackUiConfigPresent = checkGluestackConfig();
    expect(gluestackUiConfigPresent).toBeTruthy();

    // Checks weather required dependencies are added or not
    const packageJsonPath = path.join(nextAppPath, 'package.json');
    const packageJsonData = JSON.parse(
      fs.readFileSync(packageJsonPath, 'utf-8')
    );
    const requiredDependencies = [
      '@dank-style/react',
      '@gluestack-ui/provider',
      '@dank-style/animation-plugin',
      '@gluestack/ui-next-adapter',
    ];
    const devDependencies = ['react-native-web', 'react-native'];
    requiredDependencies.forEach(dependency => {
      expect(packageJsonData.dependencies).toHaveProperty(dependency);
    });
    devDependencies.forEach(dependency => {
      expect(packageJsonData.devDependencies).toHaveProperty(dependency);
    });

    const { document, nextConfig, app } = getDataFiles('components');
    // Checks weather next.config is updated or not
    const nextConfigPath = path.join(nextAppPath, 'next.config.js');
    const nextConfigCode = fs.readFileSync(nextConfigPath, 'utf-8');
    expect(nextConfigCode).toEqual(nextConfig);

    // Checks weather _document is updated or not
    const documentPath = path.join(nextAppPath, 'pages/_document.tsx');
    const documentCode = fs.readFileSync(documentPath, 'utf-8');
    expect(document).toEqual(documentCode);

    // Checks weather _app is updated or not
    const appPath = path.join(nextAppPath, 'pages/_app.tsx');
    const appCode = fs.readFileSync(appPath, 'utf-8');
    expect(app).toEqual(appCode);

    const componentPath = getConfigComponentPath();
    // Check weather components folder is created
    const componentsFolderPath = path.join(nextAppPath, componentPath);
    expect(fs.existsSync(componentsFolderPath)).toBe(true);

    // Check weather components folder is created
    const coreFolderPath = path.join(nextAppPath, componentPath, 'core');
    expect(fs.existsSync(coreFolderPath)).toBe(true);

    // Check weather styled component is added
    const styledFolderPath = path.join(
      nextAppPath,
      componentPath,
      'core',
      'styled'
    );
    expect(fs.existsSync(styledFolderPath)).toBe(true);

    // Check weather gluestack provider component is added
    const gluestackProviderFolderPath = path.join(
      nextAppPath,
      componentPath,
      'core',
      'GluestackUIProvider'
    );
    expect(fs.existsSync(gluestackProviderFolderPath)).toBe(true);

    // Check weather dependencies are installed correctly
    const packageJsonLockPath = path.join(nextAppPath, 'package-lock.json');

    const installedDependencies = JSON.parse(
      fs.readFileSync(packageJsonLockPath, 'utf-8')
    ).dependencies;
    requiredDependencies.forEach(dependency => {
      expect(installedDependencies.hasOwnProperty(dependency)).toBe(true);
    });

    const installedDevDependencies = JSON.parse(
      fs.readFileSync(packageJsonLockPath, 'utf-8')
    ).devDependencies;
    devDependencies.forEach(dependency => {
      expect(installedDevDependencies.hasOwnProperty(dependency)).toBe(true);
    });
  }, 200000);

  afterAll(() => {
    if (appProcess) {
      appProcess.kill();
    }
    // spawnSync('rm -rf', ['my-next-app'], {
    //   cwd: nextAppRootDirectory,
    //   stdio: 'inherit',
    //   shell: true,
    // });
  });
});
