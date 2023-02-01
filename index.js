#!/usr/bin/env node

const prompts = require('prompts');
const { componentAdder } = require('./component-adder');
const { initChecker } = require('./init-checker');
const { initializer } = require('./installer/initializer');
const { projectDetector } = require('./project-detector');
const { nextInstaller } = require('./installer/next');



const main = async () => {
  const commands = [
    'initializer',
    'init-checker',
    'version manager',
    'component adder',
    'project detector',
    'installer',
  ];

  const actionResponse = await prompts({
    type: 'select',
    name: 'selectedOption',
    message: 'Select task: ',
    choices: commands,
    initial: 0,
  });

  if (commands[actionResponse.selectedOption] === 'initializer') {
    await initializer();
  } else if (commands[actionResponse.selectedOption] === 'init-checker') {
    initChecker();
  } else if (commands[actionResponse.selectedOption] === 'component adder') {
    await componentAdder();
  } else if (commands[actionResponse.selectedOption] === 'version manager') {
    console.log('This feature is not available currently :(');
  } else if (commands[actionResponse.selectedOption] === 'project detector') {
    projectDetector();
  } else if (commands[actionResponse.selectedOption] === 'installer') {
    nextInstaller();
  }
};

main();
