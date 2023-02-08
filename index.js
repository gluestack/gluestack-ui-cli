#!/usr/bin/env node

// const prompts = require('prompts');
const { componentAdder } = require('./component-adder');
const { initializer } = require('./installer/initializer');

const main = async () => {
  // const commands = ['init', 'component adder'];

  // const actionResponse = await prompts({
  //   type: 'select',
  //   name: 'selectedOption',
  //   message: 'Select task: ',
  //   choices: commands,
  //   initial: 0,
  // });

  // if (commands[actionResponse.selectedOption] === 'init') {
  //   await initializer();
  // } else if (commands[actionResponse.selectedOption] === 'component adder') {
  //   await componentAdder();
  // }
  await initializer();
  await componentAdder();
};

main();
