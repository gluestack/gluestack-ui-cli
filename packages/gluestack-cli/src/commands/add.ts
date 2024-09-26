import { Command } from 'commander';
import { z } from 'zod';
import { handleError } from '../util/handle-error';
import { log } from '@clack/prompts';
import { componentAdder, hookAdder, isHookFromConfig } from '../util/add';
import { config } from '../config';
import { checkWritablePath, isValidPath, projectRootPath } from '../util';
import { checkIfInitialized, getComponentsPath } from '../util/config';

const addOptionsSchema = z.object({
  components: z.string().optional(),
  all: z.boolean(),
  useNpm: z.boolean(),
  useYarn: z.boolean(),
  usePnpm: z.boolean(),
  path: z.string().optional(),
});

export const add = new Command()
  .name('add')
  .description('add a component to your project')
  .argument('[...components]', 'the components to add')
  .option('--all, --all', 'add all available components', false)
  .option('--use-npm ,useNpm', 'use npm to install dependencies', false)
  .option('--use-yarn, useYarn', 'use yarn to install dependencies', false)
  .option('--use-pnpm, usePnpm', 'use pnpm to install dependencies', false)
  .option('--path <path>', 'path to the components directory')
  .action(async (components, opts, command) => {
    try {
      if (command.args.length > 1) {
        log.error(
          '\x1b[31mOnly one component can be provided at a time, please provide the component name you want to add or --all.\x1b[0m'
        );
        process.exit(1);
      }
      const options = addOptionsSchema.parse({
        components: components ?? '',
        ...opts,
      });
      if (
        options.all === false &&
        (options.components === '' || options.components === undefined)
      ) {
        log.error(
          '\x1b[31mInvalid arguement, please provide the component/hook name you want to add or --all.\x1b[0m'
        );
        process.exit(0);
      }
      const initialized = await checkIfInitialized(projectRootPath);
      if (!initialized) {
        log.warning(
          `\x1b[33mgluestack is not initialized in the project. use 'npx gluestack-ui init' or 'help' to continue.\x1b[0m`
        );
        process.exit(1);
      }
      //function to get current path where GUIProvider is located
      const currWritablePath = await getComponentsPath(projectRootPath);
      if (currWritablePath) {
        config.writableComponentsPath = currWritablePath;
      }
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
      if (options.all) {
        try {
          await componentAdder({
            requestedComponent: '--all',
          });
        } catch (err) {
          log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
        }
      } else if (await isHookFromConfig(options.components)) {
        options.components &&
          (await hookAdder({
            requestedHook: options.components,
          }));
      } else {
        await componentAdder({
          requestedComponent: options.components?.toLowerCase(),
        });
      }
    } catch (err) {
      handleError(err);
    }
  });
