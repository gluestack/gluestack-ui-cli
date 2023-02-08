const fs = require('fs');
const prompts = require('prompts');
const { initChecker } = require('../init-checker');
const { initialProviderAdder } = require('../component-adder');
const { projectDetector } = require('@gluestack/ui-project-detector');
const { nextInstaller } = require('./next');

const initializer = async () => {
  let gluestackUIConfigPresent = await initChecker();
  if (!gluestackUIConfigPresent) {
    // const response = await prompts({
    //   type: 'text',
    //   name: 'folderName',
    //   message: 'Enter folder name where you want to add your components',
    //   initial: './components',
    // });
    const folderName = './components';
    await initialProviderAdder(folderName);
    const projectType = await projectDetector();
    if (true || projectType === 'Next') {
      await nextInstaller();
    }
  } else {
    console.log('gluestack-ui.config.js is present.');
  }
};

module.exports = { initializer };
