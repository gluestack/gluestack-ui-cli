const fs = require('fs');
const prompts = require('prompts');
const { initChecker } = require('../init-checker');
const { initialProviderAdder } = require('../component-adder');
const { projectDetector } = require('@gluestack/ui-project-detector');
const { nextInstaller } = require('./next');
const { expoInstaller } = require('./expo');
const { installDependencies } = require('../component-adder/utils');
const currDir = process.cwd();

const installGluestackUI = async () => {
  const response = await prompts({
    type: 'text',
    name: 'folderName',
    message: 'Enter folder path where you want to add your components',
    initial: 'components',
  });

  await initialProviderAdder('./' + response.folderName);

    const finalmessage = `
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
  let setupTypeAutomatic = 'y';
  if (projectData.framework === 'Next' && projectData.os === 'darwin') {
    setupTypeAutomatic = await nextInstaller(response.folderName);
    if (setupTypeAutomatic === 'y') {
      console.log(`\nAuto setup was successful!`);
    } else {
      console.log(finalmessage)
      console.log(
        `\n\nPlease visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`
      );
    }
  } else if (projectData.framework === 'Expo' && projectData.os === 'darwin') {
    await expoInstaller();
    console.log(finalmessage)
  } else {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'WARNING: gluestack-ui cli is currently not compatible with this platform. Please configure it manually in your project.'
    );
  }



};

const initializer = async (askUserToInit) => {
  let gluestackUIConfigPresent = await initChecker();
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
  } else {
    console.log(
      '\x1b[32m',
      `\ngluestack-ui is already initialised in your project!`,
      '\x1b[0m'
    );
  }
};

module.exports = { initializer };
