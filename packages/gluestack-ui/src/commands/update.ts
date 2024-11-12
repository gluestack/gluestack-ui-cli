import { log, confirm } from '@clack/prompts';
import { getComponentGitRepo } from '../component-adder';
import { initializer } from '../installer/initializer';
import { updateComponent } from '../update-component';
import { installDependencies } from '../utils';

export const update = async (
  subCommand: string,
  forceUpdate?: boolean,
  installationMethod?: string
) => {
  await getComponentGitRepo();
  const askUserToInit = true;

  const { gluestackUIInstalled } = await initializer(askUserToInit, 'update');
  if (gluestackUIInstalled) {
    if (subCommand === '--all') {
      try {
        if (!forceUpdate) {
          const shouldContinue = await confirm({
            message:
              'Are you sure you want to update all components? This will remove all your existing changes and replace them with new components.\nPlease make sure to commit your current changes before proceeding.',
          });
          if (shouldContinue) {
            await updateComponent('--all', forceUpdate);
          }
        } else {
          await updateComponent('--all', forceUpdate);
        }
      } catch (err) {
        log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
      }
    } else if (subCommand) {
      await updateComponent(subCommand, forceUpdate);
    } else {
      log.error(
        `\x1b[31mInvalid command, checkout help command by running npx gluestack-ui@latest help\x1b[0m`
      );
    }
    await installDependencies(installationMethod);
  }
};
