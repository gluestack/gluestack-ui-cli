import { log, confirm } from '@clack/prompts';
import { getComponentGitRepo } from '../component-adder';
import { initializer } from '../installer/initializer';
import { updateComponent } from '../update-component';
import { installDependencies } from '../utils';
import {
  INVALID_COMMAND_ERROR_MESSAGE,
  UPDATE_CONFIRMATION_MESSAGE,
} from '../Constants';

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
            message: UPDATE_CONFIRMATION_MESSAGE,
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
      log.error(INVALID_COMMAND_ERROR_MESSAGE);
    }
    await installDependencies(installationMethod);
  }
};
