const fs = require('fs');
const prompts = require('prompts');
const { initChecker } = require('../init-checker');
const { initialProviderAdder } = require('../component-adder');
const { projectDetector } = require('@gluestack/ui-project-detector');
const { nextInstaller } = require('./next');
const { expoInstaller } = require('./expo');

const installGluestackUI = async () => {
  const response = await prompts({
    type: 'text',
    name: 'folderName',
    message: 'Enter folder name where you want to add your components',
    initial: 'components',
  });

  await initialProviderAdder('./' + response.folderName);

  const projectData = await projectDetector();
  if (projectData === 'Next') {
    await nextInstaller();
  } else if (projectData === 'Expo') {
    await expoInstaller();
  } else if (projectData === 'React') {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'WARNING: gluestack/ui react installer is currently not available. Please configure it manually in your project.'
    );
  }
};

const initializer = async (askUserToInit) => {
  let gluestackUIConfigPresent = await initChecker();
  if (!gluestackUIConfigPresent) {
    let install = true;
    if (askUserToInit) {
      console.log(
        '\x1b[31m',
        `\ngluestack/ui is not initialised in your project!`,
        '\x1b[0m'
      );

      const proceedResponse = await prompts({
        type: 'text',
        name: 'proceed',
        message: 'Do you wish to initialise it? (y/n) ',
        initial: 'y',
      });

      if (proceedResponse.proceed.toLowerCase() === 'n') {
        install = false;
      }
    }

    if (install) {
      await installGluestackUI();
    }
  } else {
    console.log(
      '\x1b[32m',
      `\ngluestack/ui is already initialised in your project!`,
      '\x1b[0m'
    );
  }
};

module.exports = { initializer };
