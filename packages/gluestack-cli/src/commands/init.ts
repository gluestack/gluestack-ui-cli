import { Command } from 'commander';
import { z } from 'zod';
import { handleError } from '../util/handle-error';
import path, { join } from 'path';
import { existsSync } from 'fs';
import { log } from '@clack/prompts';
import { InitializeGlueStack } from '../util/init-gluestack';
import { config } from '../config';
import { checkWritablePath, isValidPath } from '../util';

const initOptionsSchema = z.object({
  cwd: z.string(),
  useNpm: z.boolean(),
  useYarn: z.boolean(),
  usePnpm: z.boolean(),
  componentsPath: z.string(),
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
  .option(
    '--components-path <componentsPath>',
    'path to the components directory. defaults to components/ui',
    'components/ui'
  )
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
      // Check if the string starts with "/" or "."
      if (!isValidPath(options.componentsPath)) {
        log.error(
          `\x1b[31mInvalid path "${options.componentsPath}". Please provide a valid path for installing components.\x1b[0m`
        );
        process.exit(1);
      }

      if (options.componentsPath !== config.writableComponentsPath) {
        await checkWritablePath(options.componentsPath);
      }

      config.writableComponentsPath = options.componentsPath;
      config.UIconfigPath = join(
        options.componentsPath,
        'gluestack-ui-provider/config.ts'
      );
      InitializeGlueStack({
        installationMethod,
      });
    } catch (err) {
      handleError(err);
    }
  });
