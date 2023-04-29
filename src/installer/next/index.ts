import addDependencies from '../utils';
import { autoSetup } from './utils';
import { installDependencies } from '../../component-adder/utils';

const nextInstaller = async (folderName: string): Promise<boolean> => {
  try {
    addDependencies('Next');
    const setupTypeAutomatic = await autoSetup(folderName);
    // await installDependencies();
    return setupTypeAutomatic === 'y';
  } catch (err) {
    console.error(
      `Error installing Next.js dependencies: ${(err as Error).message}`
    );
    return false;
  }
};

export { nextInstaller };
