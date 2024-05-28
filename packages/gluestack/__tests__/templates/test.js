const fs = require('fs');
const path = require('path');
const util = require('util');
const { spawn, spawnSync } = require('child_process');

const templatesDir = path.resolve(__dirname, '../../../../apps/templates');

// const templates = fs
//   .readdirSync(templatesDir)
//   .filter((file) => fs.statSync(path.join(templatesDir, file)).isDirectory());

// for (const template of templates) {
const template = 'expo-with-gluestack-style';
test(`Test template: ${template}`, () => {
  return new Promise((resolve, reject) => {
    console.log(`Testing template: ${template}`);

    const templateDir = path.join(templatesDir, template);
    console.log(`Template directory: ${templateDir}`);

    const installCommand = spawn('yarn start', {
      cwd: templateDir,
      shell: true,
      stdio: 'pipe',
    });
    console.log('here', installCommand.pid);
    // for await (const data of installCommand.stdout) {
    //   console.log(`stdout: ${data}`);
    // }

    installCommand.stdin.setEncoding('utf-8');

    installCommand.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    installCommand.on('close', () => {
      console.log('Install command completed');
      resolve();
    });

    installCommand.on('error', (error) => {
      console.error(`Install command failed: ${error}`);
      reject(error);
    });
  });
});
// }
