import { confirm, log } from '@clack/prompts';
import {
  REMOVE_CONFIRMATION_MESSAGE,
  INVALID_COMMAND_ERROR_MESSAGE,
} from '../Constants';
import { initializer } from '../installer/initializer';
import { removeComponent } from '../remove-component';

export const remove = async (subCommand: string) => {
  const askUserToInit = true;

  const { gluestackUIInstalled } = await initializer(askUserToInit, 'remove');
  if (gluestackUIInstalled) {
    if (subCommand === '--all') {
      try {
        const shouldContinue = await confirm({
          message: REMOVE_CONFIRMATION_MESSAGE,
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
      log.error(INVALID_COMMAND_ERROR_MESSAGE);
    }
  }
};
