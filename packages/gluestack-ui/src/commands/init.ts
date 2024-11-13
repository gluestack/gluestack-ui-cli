import { log } from '@clack/prompts';
import { INIT_GREETING_1, INIT_OUTRO_2, INIT_OUTRO_1 } from '../Constants';
import { initializer } from '../installer/initializer';
import { getComponentGitRepo } from '../component-adder';
import { installDependencies } from '../utils';

export const init = async (installationMethod?: string) => {
  await getComponentGitRepo();
  const askUserToInit = true;
  const { gluestackUIConfigPresent: alreadyInitialised } = await initializer(
    !askUserToInit,
    'init'
  );
  if (alreadyInitialised) {
    log.info(INIT_GREETING_1);
  } else {
    await installDependencies(installationMethod);
    log.info(INIT_OUTRO_1);
  }
  log.info(INIT_OUTRO_2);
};
