import { Command } from 'commander';
import { z } from 'zod';
import { handleError } from '../util/handle-error';
import path from 'path';
import { existsSync } from 'fs';
import { log } from '@clack/prompts';
import { InitializeGlueStack } from '../util/init-gluestack';

const initOptionsSchema = z.object({
  cwd: z.string(),
  useNpm: z.boolean(),
  useYarn: z.boolean(),
  usePnpm: z.boolean(),
});

export const init = new Command()
  .name('init')
  .description('Initialize gluestack into your project')
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .option('--use-npm ,useNpm', 'use npm to install dependencies', false)
  .option('--use-yarn, useYarn', 'use yarn to install dependencies', false)
  .option('--use-pnpm, usePnpm', 'use pnpm to install dependencies', false)
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse({ ...opts });
      let installationMethod;
      if (options.useNpm || options.useYarn || options.usePnpm) {
        if (options.useNpm) installationMethod = 'npm';
        if (options.usePnpm) installationMethod = 'pnpm';
        if (options.useYarn) installationMethod = 'yarn';
      }
      const cwd = path.resolve(options.cwd);
      if (!existsSync(cwd)) {
        log.error(`The path ${cwd} does not exist. Please try again.`);
        process.exit(1);
      }
      InitializeGlueStack({
        installationMethod,
      });
    } catch (err) {
      handleError(err);
    }
  });
