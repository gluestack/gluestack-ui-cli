import prompts from 'prompts';
import { initChecker } from '../init-checker';
import { initialProviderAdder } from '../component-adder';
import { projectDetector } from '@gluestack/ui-project-detector';
import { nextInstaller } from './next';
import { expoInstaller } from './expo';

const installGluestackUI = async (): Promise<void> => {
  try {
    const response = await prompts({
      type: 'text',
      name: 'folderName',
      message: 'Enter folder path where you want to add your components',
      initial: 'components',
    });

    await initialProviderAdder('./' + response.folderName);

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

    if (projectData.framework === 'Next' && projectData.os === 'darwin') {
      setupTypeAutomatic = await nextInstaller(response.folderName);

      if (setupTypeAutomatic) {
        console.log('\x1b[32m', '\nAuto setup was successful!');
      } else {
        console.log('\x1b[32m', finalMessage);
        console.log(
          '\x1b[32m',
          `\nPlease visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`
        );
      }
    } else if (
      projectData.framework === 'Expo' &&
      projectData.os === 'darwin'
    ) {
      await expoInstaller();
      console.log('\x1b[32m', finalMessage);
    } else {
      console.warn(
        '\x1b[31m%s\x1b[0m',
        'WARNING: The gluestack-ui CLI is currently in an experimental stage for your specific framework or operating system configuration.'
      );
      await expoInstaller();
    }
  } catch (error) {
    console.error(
      '\x1b[31m',
      `Error installing gluestack-ui: ${(error as Error).message}`
    );
  }
};

const initializer = async (askUserToInit: boolean): Promise<boolean> => {
  try {
    const gluestackUIConfigPresent = await initChecker();
    if (!gluestackUIConfigPresent) {
      let install = true;
      if (askUserToInit) {
        console.log(
          '\x1b[31m',
          `\ngluestack-ui is not initialised in your project!`,
          '\x1b[0m'
        );

        const proceedResponse = await prompts({
          type: 'text',
          name: 'proceed',
          message: 'Do you wish to initialise it? (y/n) ',
          initial: 'y',
        });

        if (proceedResponse.proceed.toLowerCase() === 'n') {
          install = false;
        }
      }

      if (install) {
        await installGluestackUI();
      }
      console.log('\u001b[32mgluestack-ui initialization completed!\u001b[0m');
    } else {
      console.log(
        '\u001b[32mgluestack-ui is already initialized in your project!\u001b[0m'
      );
    }
    return gluestackUIConfigPresent;
  } catch (err) {
    console.error(
      '\x1b[31m',
      `Error initializing gluestack-ui: ${(err as Error).message}`
    );
    return false;
  }
};

export { initializer };
