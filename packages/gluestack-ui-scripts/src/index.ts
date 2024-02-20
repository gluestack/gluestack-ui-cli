#!/usr/bin/env node
// process.on('unhandledRejection', err => {
//   throw err;
// });

// import { ejectComponents } from './scripts/eject';
import process from 'process';
import { ejectTheme } from './scripts/eject-theme';
import { intro, outro, select } from '@clack/prompts';
import { ejectComponents } from './scripts/eject-components';
const args = process.argv.slice(2);
const scriptIndex = args.findIndex((x) => x === 'eject-theme');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
async function main() {
  intro(`gluestack-ui-scripts`);
  // if (['eject-theme'].includes(script)) {
  const ejectType = await select({
    message: 'What do you want to eject?',
    options: [
      {
        value: 'config',
        label: 'Eject Config',
        hint: 'This will eject/add the components config inside your app.',
      },
      {
        value: 'design-system',
        label: 'Eject Components & Config',
        hint: 'This will eject/add the styled components with config inside your app. (This provides maximum customization, Recommended)',
      },
    ],
  });
  if (ejectType == 'config') {
    await ejectTheme();
    outro(`You're all set!`);
  } else if (ejectType == 'design-system') {
    await ejectComponents();
  }
  process.exit(1);
  // } else {
  //   console.log('Unknown script "' + script + '".');
  //   console.log('Perhaps you need to update gluestack-ui-scripts?');
  // }
}

main();
