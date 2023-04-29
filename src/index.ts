import { componentAdder, getComponentGitRepo } from './component-adder';
import { installDependencies } from './component-adder/utils';
import { updateComponent } from './update-component';
import { initializer } from './installer/initializer';
import { removeComponent } from './remove-component';
import prompts from 'prompts';

async function main() {
  await getComponentGitRepo();
  const askUserToInit = true;
  if (
    process.argv.length === 2 ||
    (process.argv.length === 3 && process.argv[2] === 'add')
  ) {
    await initializer(askUserToInit);
    await componentAdder();
  } else if (process.argv.length >= 3 && process.argv[2] === 'init') {
    const alreadyInitialised = await initializer(!askUserToInit);
    if (alreadyInitialised) {
      console.log(
        `\nReady to create amazing designs with ease? Let's start with the simple \x1b[36mBox\x1b[0m component. Check out \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to get started!`
      );

      console.log(
        `\n🚀 Feeling adventurous? Try out the \x1b[36m'npx gluestack-ui@latest add box'\x1b[0m command in your project and watch the magic happen! ✨`
      );
    } else {
      console.log(
        `\n\x1b[1m\x1b[36mCongrats, gluestack-ui is now part of your project! 🎉\x1b[0m\nTime to unleash your creativity with the simple \x1b[36mBox\x1b[0m component. Head over to \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to learn more!`
      );
      console.log(
        `\nFeeling adventurous? Try the \x1b[1m\x1b[36mnpx gluestack-ui@latest add box\x1b[0m\x1b[0m command and watch the magic happen. ✨`
      );

      // console.log(
      //   '\n' +
      //     'The gluestack-ui is now initialized in your project! Visit ' +
      //     '\x1b[36m' +
      //     'https://ui.gluestack.io/docs/components/layout/box' +
      //     '\x1b[0m' +
      //     ' to get started with adding the simple Box component.'
      // );
      // console.log(
      //   '\n' +
      //     'Or, you can directly try ' +
      //     '\x1b[36m' +
      //     'npx gluestack-ui@latest add box' +
      //     '\x1b[0m' +
      //     ' command in your project.'
      // );
    }
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
    console.log(`
  - Init gluestack-ui
    npx gluestack-ui@latest init

  - Init and add components
    npx gluestack-ui@latest

  - Add component
    npx gluestack-ui@latest add <component-name>

  - Update a component
    npx gluestack-ui@latest update <component-name>

  - Remove a component
    npx gluestack-ui@latest remove <component-name>

  - Help
    npx gluestack-ui@latest help`);
  } else if (process.argv.length >= 4 && process.argv[2] === 'update') {
    if (process.argv[3]) {
      await updateComponent(process.argv[3]);
    }
  } else if (process.argv.length == 4 && process.argv[2] === 'update') {
    await updateComponent('');
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
          "Are you sure you want to add all components? This will remove all your existing changes and replace them with new components.\nPlease make sure to commit your current changes before proceeding.\nTo continue, type 'y' for yes. To cancel and exit, type 'n' for no.",
        initial: 'y',
      });
      if (proceedResponse.proceed.toLowerCase() == 'y') {
        await initializer(askUserToInit);
        await componentAdder('--all');
      }
    } catch (err) {
      console.log(err);
    }
  }
  // await installDependencies();
}

main();
