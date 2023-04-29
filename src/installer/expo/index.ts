import addDependencies from '../utils';
import { installDependencies } from '../../component-adder/utils';
const expoInstaller = async () => {
  try {
    addDependencies();
    // await installDependencies();
  } catch (err) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `Error in Expo installer: ${(err as Error).message}`
    );
  }
};

export { expoInstaller };
