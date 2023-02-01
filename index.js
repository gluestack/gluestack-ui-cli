#!/usr/bin/env node

const prompts = require('prompts');
const { componentAdder } = require('./component-adder');
const { initChecker } = require('./init-checker');
const { initializer } = require('./installer/initializer');

const main = async () => {
  console.log('Mayank Testing locallly updated');
  const commands = [
    'initializer',
    'init-checker',
    'version manager',
    'component adder',
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
  }
};

main();
