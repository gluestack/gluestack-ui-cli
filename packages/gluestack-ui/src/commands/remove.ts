import { confirm, log } from '@clack/prompts';
import { initializer } from '../installer/initializer';
import { removeComponent } from '../remove-component';

export const remove = async (subCommand: string) => {
  const askUserToInit = true;

  const { gluestackUIInstalled } = await initializer(askUserToInit, 'remove');
  if (gluestackUIInstalled) {
    if (subCommand === '--all') {
      try {
        const shouldContinue = await confirm({
          message: 'Are you sure you want to remove all components?',
        });
        if (shouldContinue) {
          await removeComponent('--all');
        }
      } catch (err) {
        log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
      }
    } else if (subCommand) {
      await removeComponent(subCommand);
    } else {
      log.error(
        `\x1b[31mInvalid command, checkout help command by running npx gluestack-ui@latest help\x1b[0m`
      );
    }
  }
};
