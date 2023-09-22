#!/usr/bin/env node
// process.on('unhandledRejection', err => {
//   throw err;
// });

import { ejectComponents } from './scripts/eject';
import { ejectTheme } from './scripts/eject-theme';
import process from 'process';

const args = process.argv.slice(2);
const ejectThemeScriptIndex = args.findIndex((x) => x === 'eject');
const ejectThemeScript =
  ejectThemeScriptIndex === -1 ? args[0] : args[ejectThemeScriptIndex];
const ejectScriptIndex = args.findIndex((x) => x === 'eject');
const ejectScript = ejectScriptIndex === -1 ? args[0] : args[ejectScriptIndex];
async function main() {
  if (['eject'].includes(ejectScript)) {
    // FIX: Loop through commands
    const result = await ejectComponents();
    process.exit(1);
  } else {
    console.log('Unknown script "' + ejectScript + '".');
    console.log('Perhaps you need to update gluestack-ui-scripts?');
  }
  if (['eject-theme'].includes(ejectThemeScript)) {
    const result = await ejectTheme();
    process.exit(1);
  } else {
    console.log('Unknown script "' + ejectThemeScript + '".');
    console.log('Perhaps you need to update gluestack-ui-scripts?');
  }
}

main();
