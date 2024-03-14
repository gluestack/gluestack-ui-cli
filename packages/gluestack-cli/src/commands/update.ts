import { Command } from 'commander';
import { z } from 'zod';
import { handleError } from '../util/handle-error';
import path from 'path';
import { existsSync } from 'fs';
import { log } from '@clack/prompts';

const updateOptionsSchema = z.object({
  components: z.string().optional(),
  cwd: z.string(),
  all: z.boolean(),
  forceUpdate: z.boolean(),
  useNpm: z.boolean(),
  useYarn: z.boolean(),
  usePnpm: z.boolean(),
});

export const update = new Command()
  .name('add')
  .description('update component in your project')
  .argument('[...components]', 'the components to update')
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .option('--all, --all', 'update all available components', false)
  .option('-f, --force-update', 'force update the component.', false)
  .option('--use-npm ,useNpm', 'use npm to install dependencies', false)
  .option('--use-yarn, useYarn', 'use yarn to install dependencies', false)
  .option('--use-pnpm, usePnpm', 'use pnpm to install dependencies', false)
  .action(async (components, opts, command) => {
    try {
      if (command.args.length > 1) {
        log.error(
          '\x1b[31mOnly one component can be provided at a time, please provide the component name you want to update or --all.\x1b[0m'
        );
        process.exit(1);
      }
      const options = updateOptionsSchema.parse({
        components: components ?? '',
        ...opts,
      });
      if (
        options.all === false &&
        (options.components === '' || options.components === undefined)
      ) {
        log.error(
          '\x1b[31mInvalid arguement, please provide the component name you want to add or --all.\x1b[0m'
        );
        process.exit(0);
      }
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
      if (options.all) {
        try {
          console.log('update all components');
        } catch (err) {
          log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
        }
      } else {
        console.log('update single component');
      }
    } catch (err) {
      handleError(err);
    }
  });
