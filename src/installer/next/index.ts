import addDependencies from '../utils';
import { autoSetup } from './utils';
import { log } from '@clack/prompts';

const nextInstaller = async (folderName: string): Promise<boolean> => {
  try {
    addDependencies('Next');
    const setupTypeAutomatic = await autoSetup(folderName);
    return setupTypeAutomatic;
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return false;
  }
};

export { nextInstaller };
