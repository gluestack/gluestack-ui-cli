#!/usr/bin/env node
import { componentAdder, getComponentGitRepo } from './component-adder';
import { updateComponent } from './update-component';
import { initializer } from './installer/initializer';
import { removeComponent } from './remove-component';
import { intro, outro, confirm, log } from '@clack/prompts';
import { installDependencies } from './utils';
import { ejectComponents } from './eject-components';

async function main() {
  intro(`gluestack-ui`);
  let supportedArgs = ['--use-npm', '--use-yarn', '--use-pnpm'];
  const command = process.argv[2];
  const subCommand = process.argv[3];
  const args = process.argv.splice(4);
  let installationMethod;
  let forceUpdate;

  for (let i = 0; i < args.length; i++) {
    if (supportedArgs.includes(args[i])) {
      if (args[i] === '--use-npm') {
        installationMethod = 'npm install --legacy-peer-deps';
      } else if (args[i] === '--use-yarn') {
        installationMethod = 'yarn';
      } else if (args[i] === '--use-pnpm') {
        installationMethod = 'pnpm i --lockfile-only';
      } else if (args[i] === '--force-update') {
        forceUpdate = true;
      }
    } else {
      log.warning(
        `Unsupported argument: ${args[i]}. For more information run npx gluestack-ui help`
      );
      if (!(args[i].startsWith('-') || args[i].startsWith('--'))) {
        log.warning(`Please pass project name as first argument.`);
      }
      process.exit(0);
    }
  }

  if (command === 'help') {
    log.message(`
\x1b[36m- Init and add components\x1b[0m
  \x1b[33mnpx gluestack-ui@latest\x1b[0m

\x1b[36m- Init gluestack-ui\x1b[0m
  \x1b[33mnpx gluestack-ui@latest init\x1b[0m
  
\x1b[36m- Add component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest add <component-name>\x1b[0m

\x1b[36m- Add all component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest add --all\x1b[0m
  
\x1b[36m- Update a component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest update <component-name>\x1b[0m
  
\x1b[36m- Update all component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest update --all\x1b[0m

\x1b[36m- Remove a component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest remove <component-name>\x1b[0m
  
\x1b[36m- Remove all component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest remove --all\x1b[0m

\x1b[36m- Help\x1b[0m
  \x1b[33mnpx gluestack-ui@latest help\x1b[0m   
        `);
  } else {
    await getComponentGitRepo();
    const askUserToInit = true;

    if (command === 'init') {
      const { gluestackUIConfigPresent: alreadyInitialised } =
        await initializer(!askUserToInit, 'init');
      if (alreadyInitialised) {
        log.info(
          `Ready to create amazing designs with ease? Let's start with the simple \x1b[36mBox\x1b[0m component. Check out \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to get started!`
        );

        log.info(
          `🚀 Feeling adventurous? Try out the \x1b[36m'npx gluestack-ui@latest add box'\x1b[0m command in your project and watch the magic happen! ✨`
        );
      } else {
        await installDependencies(installationMethod);
        log.info(
          `\x1b[1m\x1b[36mCongrats, gluestack-ui is now part of your project! 🎉\x1b[0m\nTime to unleash your creativity with the simple \x1b[36mBox\x1b[0m component. Head over to \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to learn more!`
        );
        log.info(
          `Feeling adventurous? Try the \x1b[1m\x1b[36mnpx gluestack-ui@latest add box\x1b[0m\x1b[0m command and watch the magic happen. ✨`
        );
      }
    } else if (command === 'add') {
      const { gluestackUIInstalled } = await initializer(askUserToInit, 'add');

      if (gluestackUIInstalled) {
        if (subCommand === '--all') {
          try {
            await componentAdder('--all', forceUpdate);
          } catch (err) {
            log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
          }
        } else {
          await componentAdder(subCommand, forceUpdate);
        }
        await installDependencies(installationMethod);
      }
    } else if (command === 'update') {
      const { gluestackUIInstalled } = await initializer(
        askUserToInit,
        'update'
      );
      if (gluestackUIInstalled) {
        if (subCommand === '--all') {
          try {
            if (!forceUpdate) {
              const shouldContinue = await confirm({
                message:
                  'Are you sure you want to update all components? This will remove all your existing changes and replace them with new components.\nPlease make sure to commit your current changes before proceeding.',
              });
              if (shouldContinue) {
                await updateComponent('--all', forceUpdate);
              }
            } else {
              await updateComponent('--all', forceUpdate);
            }
          } catch (err) {
            log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
          }
        } else if (subCommand) {
          await updateComponent(subCommand, forceUpdate);
        } else {
          log.error(
            `\x1b[31mInvalid command, checkout help command by running npx gluestack-ui@latest help\x1b[0m`
          );
        }
        await installDependencies(installationMethod);
      }
    } else if (command === 'remove') {
      const { gluestackUIInstalled } = await initializer(
        askUserToInit,
        'remove'
      );
      if (gluestackUIInstalled) {
        if (subCommand === '--all') {
          try {
            const shouldContinue = await confirm({
              message: 'Are you sure you want to remove all components?',
            });
            if (shouldContinue) {
              await removeComponent('--all');
            }
          } catch (err) {
            log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
          }
        } else if (subCommand) {
          await removeComponent(subCommand);
        } else {
          log.error(
            `\x1b[31mInvalid command, checkout help command by running npx gluestack-ui@latest help\x1b[0m`
          );
        }
      }
    } else if (command === 'eject') {
      await ejectComponents();
    } else {
      const { gluestackUIInstalled } = await initializer(askUserToInit, 'init');
      if (gluestackUIInstalled) {
        await componentAdder(subCommand, forceUpdate);
        await installDependencies(installationMethod);
      }
    }
  }
  outro(`You're all set!`);
}

main();
