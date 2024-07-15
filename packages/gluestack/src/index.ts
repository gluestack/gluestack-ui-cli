#! /usr/bin/env node
import { main as runLatest } from './v2';
import { main as runLegacy } from './v1';

async function main() {
  let args = process.argv.slice(2);

  // Determine which version to run and remove the version argument
  let version = 'nothing';
  if (args.includes('--v1')) {
    version = 'v1';
  } else if (args.includes('--v2')) {
    version = 'v2';
  }
  args = args.filter((arg) => arg !== '--v1' && arg !== '--v2' && arg);

  // Now run the appropriate version
  if (version === 'v1') {
    await runLegacy(args);
  } else {
    await runLatest(args);
    // version v2 or default
  }
}

main();
