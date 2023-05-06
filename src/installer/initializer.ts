import { initChecker } from '../init-checker';
import { initialProviderAdder } from '../component-adder';
import { projectDetector } from '@gluestack/ui-project-detector';
import { nextInstaller } from './next';
import { expoInstaller } from './expo';
import path from 'path';
import { isCancel, cancel, text, confirm, log } from '@clack/prompts';

const installGluestackUI = async (): Promise<boolean> => {
  try {
    const folderPath = await text({
      message:
        'Can you please provide the path where you would like to add your components?',
      placeholder: './components',
      initialValue: './components',
      validate(value) {
        if (value.length === 0) return `Value is required!`;
      },
    });

    if (isCancel(folderPath)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    await initialProviderAdder(path.join('./', folderPath));

    const finalMessage = `
    Gluestack Provider has been added to your components folder.
    To use it, simply wrap your app component with the <GluestackUIProvider> component like this:

    export default function App() {
      return (
        <GluestackUIProvider>
          <Component />
        </GluestackUIProvider>
      );
    }
    `;

    const projectData = await projectDetector();
    let setupTypeAutomatic = false;

    if (projectData.framework === 'Next') {
      setupTypeAutomatic = await nextInstaller(folderPath);

      if (setupTypeAutomatic) {
        log.success('Auto setup was successful!');
      } else {
        log.info('\x1b[32m' + finalMessage + '\x1b[0m');
        log.info(
          '\x1b[32m' +
            `Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.` +
            '\x1b[0m'
        );
      }
    } else if (projectData.framework === 'Expo') {
      await expoInstaller();
      log.info('\x1b[32m' + finalMessage + '\x1b[0m');
    } else {
      // log.warn(
      //   '\x1b[31mWARNING: The gluestack-ui CLI is currently in an experimental stage for your specific framework or operating system configuration.\x1b[0m'
      // );
      await expoInstaller();
    }
    return true;
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return false;
  }
};

const initializer = async (
  askUserToInit: boolean
): Promise<Record<string, boolean>> => {
  try {
    const gluestackUIConfigPresent = await initChecker();
    let gluestackUIInstalled = false;
    if (!gluestackUIConfigPresent) {
      let install = true;
      if (askUserToInit) {
        log.error(
          '\x1b[31m' +
            `gluestack-ui is not initialised in your project!` +
            '\x1b[0m'
        );

        const shouldContinue = await confirm({
          message: 'Do you wish to initialise it?',
        });

        if (isCancel(shouldContinue)) {
          cancel('Operation cancelled.');
          process.exit(0);
        }

        if (!shouldContinue) {
          install = false;
        }
      }

      if (install) {
        gluestackUIInstalled = await installGluestackUI();
        log.success('gluestack-ui initialization completed!');
      } else {
        log.error('\u001b[31mgluestack-ui initialization canceled!\u001b[0m');
      }
    } else {
      gluestackUIInstalled = true;
      log.success(
        '\u001b[32mgluestack-ui is already initialized in your project!\u001b[0m'
      );
    }
    return { gluestackUIConfigPresent, gluestackUIInstalled };
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return { gluestackUIConfigPresent: false, gluestackUIInstalled: false };
  }
};

export { initializer };
