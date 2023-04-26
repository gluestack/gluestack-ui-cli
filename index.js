#!/usr/bin/env node
const { componentAdder } = require('./component-adder');
const { updateComponent } = require('./update-component');
const { initializer } = require('./installer/initializer');
const { removeComponent } = require('./remove-component');
const prompts = require('prompts');

const main = async () => {
  console.log('Hello Mayank!');
  const askUserToInit = true;
  if (
    process.argv.length === 2 ||
    (process.argv.length === 3 && process.argv[2] === 'add')
  ) {
    await initializer(askUserToInit);
    await componentAdder();
  } else if (process.argv.length >= 3 && process.argv[2] === 'init') {
    await initializer(!askUserToInit);
    console.log(
      '\nThe Gluestack UI is now initialized in your project! Visit https://ui.gluestack.io/docs/components/layout/box to get started with adding the simple Box component.\n'
    );
  } else if (
    process.argv.length >= 4 &&
    process.argv[2] === 'add' &&
    process.argv[3] !== '--all'
  ) {
    if (process.argv[3]) {
      await initializer(askUserToInit);
      await componentAdder(process.argv[3]);
    }
  } else if (process.argv.length === 3 && process.argv[2] == 'help') {
    console.log('Coming soon!!!');
  } else if (process.argv.length >= 4 && process.argv[2] === 'update') {
    if (process.argv[3]) {
      await updateComponent(process.argv[3]);
    }
  } else if (process.argv.length == 4 && process.argv[2] === 'update') {
    await updateComponent(null);
  } else if (process.argv.length == 4 && process.argv[2] === 'remove') {
    if (process.argv[3]) {
      await removeComponent(process.argv[3]);
    }
  } else if (
    process.argv.length >= 4 &&
    process.argv[2] === 'add' &&
    process.argv[3] === '--all'
  ) {
    try {
      const proceedResponse = await prompts({
        type: 'text',
        name: 'proceed',
        message:
          "Are you sure you want to add all components? This will remove all your existing changes and replace them with new components.\n\nPlease make sure to commit your current changes before proceeding.\n\nTo continue, type 'y' for yes. To cancel and exit, type 'n' for no.",
        initial: 'y',
      });
      if (proceedResponse.proceed == 'y') {
        await initializer(askUserToInit);
        await componentAdder('--all');
      }
    } catch (err) {
      console.log(err);
    }
  }
};

main();
