#! /usr/bin/env node
import { main as runLatest } from './v2';
import { main as runLegacy } from './v1';

async function main() {
  let args = process.argv;

  // Determine which version to run and remove the version argument
  let version = 'nothing';
  if (args.includes('--v1')) {
    version = 'v1';
    const index = args.indexOf('--v1');
    args.splice(index, 1);
  } else if (args.includes('--v2')) {
    version = 'v2';
    const index = args.indexOf('--v2');
    args.splice(index, 1);
  }
  process.argv = args.filter((arg) => arg !== '--v1' && arg !== '--v2' && arg);

  // Update process.argv with the modified arguments
  process.argv = [process.argv[0], process.argv[1], ...args];

  // Now run the appropriate version

  if (version === 'v2') {
    await runLatest();
  } else {
    // version v1 or default
    await runLegacy();
  }
}
main();
