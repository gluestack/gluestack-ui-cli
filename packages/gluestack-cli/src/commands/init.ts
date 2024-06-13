import { Command } from 'commander';
import { z } from 'zod';
import { handleError } from '../util/handle-error';
import { log } from '@clack/prompts';
import { InitializeGlueStack } from '../util/init-gluestack';
import { config } from '../config';
import {
  checkWritablePath,
  detectProjectType,
  isValidPath,
  projectRootPath,
} from '../util';

const initOptionsSchema = z.object({
  useNpm: z.boolean(),
  useYarn: z.boolean(),
  usePnpm: z.boolean(),
  path: z.string().optional(),
});

export const init = new Command()
  .name('init')
  .description('Initialize gluestack into your project')
  .option('--use-npm ,useNpm', 'use npm to install dependencies', false)
  .option('--use-yarn, useYarn', 'use yarn to install dependencies', false)
  .option('--use-pnpm, usePnpm', 'use pnpm to install dependencies', false)
  .option(
    '--path <path>',
    'path to the components directory. defaults to components/ui'
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
      // Check if the string starts with "/" or "."
      if (options.path && !isValidPath(options.path)) {
        log.error(
          `\x1b[31mInvalid path "${options.path}". Please provide a valid path for installing components.\x1b[0m`
        );
        process.exit(1);
      }
      if (options.path && options.path !== config.writableComponentsPath) {
        await checkWritablePath(options.path);
        config.writableComponentsPath = options.path;
      }
      const projectType = await detectProjectType(projectRootPath);
      InitializeGlueStack({
        installationMethod,
        projectType,
      });
    } catch (err) {
      handleError(err);
    }
  });
