import { Command } from 'commander';
import { z } from 'zod';
import { handleError } from '../util/handle-error';
import path from 'path';
import { existsSync } from 'fs';
import { log } from '@clack/prompts';
import { componentAdder } from '../util/add-components';

const addOptionsSchema = z.object({
  components: z.string().optional(),
  cwd: z.string(),
  all: z.boolean(),
  path: z.string().optional(),
  forceUpdate: z.boolean(),
  askUserToInit: z.boolean(),
  useNpm: z.boolean(),
  useYarn: z.boolean(),
  usePnpm: z.boolean(),
});

export const add = new Command()
  .name('add')
  .description('add a component to your project')
  .argument('[...components]', 'the components to add')
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .option('--all, --all', 'add all available components', false)
  .option('-p, --path <path>', 'the path to add the component to.')
  .option('-f, --force-update', 'force update the component.', false)
  .option('--ask-user-to-init', 'ask user to init the project', true)
  .option('--use-npm ,useNpm', 'use npm to install dependencies', false)
  .option('--use-yarn, useYarn', 'use yarn to install dependencies', false)
  .option('--use-pnpm, usePnpm', 'use pnpm to install dependencies', false)
  .action(async (components, opts) => {
    try {
      const options = addOptionsSchema.parse({
        components: components ?? '',
        ...opts,
      });
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
          await componentAdder({
            requestedComponent: '--all',
            installationMethod: installationMethod,
          });
        } catch (err) {
          log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
        }
      } else {
        await componentAdder({
          requestedComponent: options.components?.toLowerCase(),
          installationMethod: installationMethod,
        });
      }
    } catch (err) {
      handleError(err);
    }
  });
