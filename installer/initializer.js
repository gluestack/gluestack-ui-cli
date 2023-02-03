const fs = require('fs');
const prompts = require('prompts');
const { initChecker } = require('../init-checker');
const process = require('process');
const { initialProviderAdder } = require('../component-adder');
const { projectDetector } = require('@gluestack/ui-project-detector');
const { nextInstaller } = require('./next');

const initializer = async () => {
  let gluestackUIConfigPresent = await initChecker();
  const folderPath = process.cwd();
  if (!gluestackUIConfigPresent) {
    const response = await prompts({
      type: 'text',
      name: 'folderName',
      message: 'Enter folder name where you want to add your components',
      initial: './components',
    });
    await initialProviderAdder(response.folderName);
    const projectType = await projectDetector();
    if (true || projectType === 'Next') {
      await nextInstaller();
    }
  } else {
    console.log('gluestack-ui.config.js is present.');
  }
};

// const initializer = async () => {
//   let gluestackUIConfigPresent = await initChecker();
//   const folderPath = process.cwd();
//   if (!gluestackUIConfigPresent) {
//     // Add gluestack.config.ts
//     const configPath = folderPath + '/gluestack-ui.config.js';

//     const response = await prompts({
//       type: 'text',
//       name: 'folderName',
//       message: 'Enter folder name where you want to add your components',
//       initial: './components',
//     });

//     const newConfig = `module.exports = {
//       componentsPath: ['./${response.folderName}'],
//     };`;

//     fs.writeFile(configPath, newConfig, function (err) {
//       if (err) throw err;
//       console.log('gluestack-ui.config.js is created successfully.');
//     });
//   } else {
//     console.log('gluestack-ui.config.js is already present.');
//   }
// };

module.exports = { initializer };
