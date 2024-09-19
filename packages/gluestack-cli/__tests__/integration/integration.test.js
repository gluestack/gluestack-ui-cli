const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, '../apps');

const runCommand = (command, cwd, expectedOutput, inputs = []) => {
  return new Promise((resolve, reject) => {
    const parts = command.split(' ');
    const process = spawn(parts[0], parts.slice(1), {
      cwd,
      shell: true,
    });

    let output = '';
    let inputIndex = 0;
    // interactive prompt inputs
    process.stdout.on('data', () => {
      if (inputIndex < inputs.length) {
        process.stdin.write(inputs[inputIndex] + '\n');
        inputIndex++;
      }
    });

    process.stdout.on('data', (data) => {
      output += data.toString();
      process.stdin.write('\n'); // Optional: log output in real-time
    });

    process.stderr.on('data', (data) => {
      output += data.toString();
      process.stdin.write('\n'); // Optional: log errors in real-time
    });

    process.on('close', (code) => {
      console.log(`child process close all stdio with code ${code}`);
      resolve();
    });

    process.on('exit', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve();
    });

    process.on('error', function (error) {
      console.log(error);
      reject();
    });
  });
};

const cleanupDir = (dir) => {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

describe('Gluestack CLI Integration Tests', () => {
  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir);
    }
  });

  afterAll(() => {
    cleanupDir(testDir);
  });

  //create and run expo app
  test('Expo app creation and Gluestack UI integration', () => {
    const expoDir = path.join(testDir, 'test-expo-app');
    runCommand(
      `npx create-expo-app ${expoDir}`,
      testDir,
      'Your project is ready!'
    );
    runCommand(
      `node ../../dist/index.js init`,
      expoDir,
      'initialized successfully'
    );
    runCommand(
      `node ../../dist/index.js add button`,
      expoDir,
      'Button component added successfully'
    );
    const startOutput = runCommand(
      `npx expo start --no-dev --minify`,
      expoDir,
      'Starting Metro bundler'
    );
    expect(startOutput).toContain('Starting Metro bundler');
    expect(
      fs.existsSync(path.join(expoDir, 'node_modules', '@gluestack-ui'))
    ).toBeTruthy();
  }, 300000); // 5 minutes timeout

  // create and run next.js app
  test('Next.js app creation and Gluestack UI integration', () => {
    const nextDir = path.join(testDir, 'test-next-app');
    runCommand(
      `npx create-next-app ${nextDir} --typescript --eslint`,
      testDir,
      'created successfully'
    );
    // Create Next.js app with interactive prompts
    runCommand('npx create-next-app .', nextDir, '', [
      '', // Project name (default)
      'y', // TypeScript
      'n', // ESLint
      'n', // Tailwind CSS
      'n', // `src/` directory
      'y', // App Router
      'n', // Customize default import alias
    ]);
    runCommand(
      `node ../../dist/index.js init`,
      nextDir,
      'Gluestack UI initialized successfully'
    );
    runCommand(
      `node ../../dist/index.js add button`,
      nextDir,
      'Button component added successfully'
    );
    const buildOutput = runCommand(`yarn build`, nextDir);
    expect(buildOutput).toContain('Compiled successfully');
    expect(
      fs.existsSync(path.join(nextDir, 'node_modules', '@gluestack-ui'))
    ).toBeTruthy();
  }, 300000); // 5 minutes timeout

  // create and run React Native App
  test('React Native app creation and Gluestack UI integration', () => {
    const rnDir = path.join(testDir, 'TestRNApp');
    runCommand(
      `npx react-native init TestRNApp`,
      testDir,
      'Run instructions for'
    );
    runCommand(
      `node ../../dist/index.js init`,
      rnDir,
      'Gluestack UI initialized successfully'
    );
    runCommand(
      `node ../../dist/index.js add button`,
      rnDir,
      'Button component added successfully'
    );
    const startOutput = runCommand(
      `npx react-native start`,
      rnDir,
      'Metro waiting on'
    );
    expect(startOutput).toContain('Metro waiting on');
    expect(
      fs.existsSync(path.join(rnDir, 'node_modules', '@gluestack-ui'))
    ).toBeTruthy();
  }, 600000); // 10 minutes timeout
});
