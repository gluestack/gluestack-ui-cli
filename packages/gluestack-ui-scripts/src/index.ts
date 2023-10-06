#!/usr/bin/env node
// process.on('unhandledRejection', err => {
//   throw err;
// });

// import { ejectComponents } from './scripts/eject';
import process from 'process';
import { ejectTheme } from './scripts/eject-theme';
const args = process.argv.slice(2);
const scriptIndex = args.findIndex((x) => x === 'eject-theme');
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
async function main() {
  if (['eject-theme'].includes(script)) {
    const result = await ejectTheme();
    process.exit(1);
  } else {
    console.log('Unknown script "' + script + '".');
    console.log('Perhaps you need to update gluestack-ui-scripts?');
  }
}

main();
