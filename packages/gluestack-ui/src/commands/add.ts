import { componentAdder, getComponentGitRepo } from '../component-adder';
import { initializer } from '../installer/initializer';
import { installDependencies } from '../utils';
import { log } from '@clack/prompts';

export const add = async (
  subCommand: string,
  forceUpdate?: boolean,
  installationMethod?: string
) => {
  await getComponentGitRepo();
  const askUserToInit = true;

  const { gluestackUIInstalled } = await initializer(askUserToInit, 'add');

  if (gluestackUIInstalled) {
    if (subCommand === '--all') {
      try {
        await componentAdder('--all', forceUpdate);
      } catch (err) {
        log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
      }
    } else {
      await componentAdder(subCommand, forceUpdate);
    }
    await installDependencies(installationMethod);
  }
};
