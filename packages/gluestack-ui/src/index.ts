#!/usr/bin/env node
import { Command } from 'commander';
import { getPackageInfo } from './util/get-package-info';
import { add } from './commands/add';
import { help } from './commands/help';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  console.log('Hello, World!');
  const packageInfo = await getPackageInfo();

  const program = new Command().name('gluestack-ui');

  program.addCommand(add).addCommand(help);
  program.parse();
}

main();
