#!/usr/bin/env node
import { Command } from 'commander';
import { log } from '@clack/prompts';
import { add } from './commands/add';
import { help } from './commands/help';

process.on('SIGINT', () => {
  log.warning('Operation ended.');
  process.exit(0);
});
process.on('SIGTERM', () => {
  log.warning('Operation cancelled.');
  process.exit(0);
});

async function main() {
  const program = new Command().name('gluestack-ui');

  program.addCommand(add).addCommand(help);
  program.parse();
}

main();
