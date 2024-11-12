#!/usr/bin/env node
import { intro, outro, log } from '@clack/prompts';
import { ejectComponents } from './eject-components';
import { help, add, update, remove, init } from './commands';

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

  switch (command) {
    case 'help':
      await help();
      break;
    case 'init':
      await init(installationMethod);
      break;
    case 'add':
      await add(subCommand, forceUpdate, installationMethod);
      break;
    case 'update':
      await update(subCommand, forceUpdate, installationMethod);
      break;
    case 'remove':
      await remove(subCommand);
      break;
    case 'eject':
      await ejectComponents();
      break;
    default:
      log.error(
        `\x1b[31mInvalid command, please check all the options available below \x1b[0m`
      );
      await help();
      break;
  }
  outro(`You're all set!`);
}

main();
