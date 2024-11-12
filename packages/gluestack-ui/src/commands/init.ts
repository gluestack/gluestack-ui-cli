import { log } from '@clack/prompts';
import { getComponentGitRepo } from '../component-adder';
import { initializer } from '../installer/initializer';
import { installDependencies } from '../utils';

export const init = async (installationMethod?: string) => {
  await getComponentGitRepo();
  const askUserToInit = true;
  const { gluestackUIConfigPresent: alreadyInitialised } = await initializer(
    !askUserToInit,
    'init'
  );
  if (alreadyInitialised) {
    log.info(
      `Ready to create amazing designs with ease? Let's start with the simple \x1b[36mBox\x1b[0m component. Check out \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to get started!`
    );

    log.info(
      `🚀 Feeling adventurous? Try out the \x1b[36m'npx gluestack-ui@latest add box'\x1b[0m command in your project and watch the magic happen! ✨`
    );
  } else {
    await installDependencies(installationMethod);
    log.info(
      `\x1b[1m\x1b[36mCongrats, gluestack-ui is now part of your project! 🎉\x1b[0m\nTime to unleash your creativity with the simple \x1b[36mBox\x1b[0m component. Head over to \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to learn more!`
    );
    log.info(
      `Feeling adventurous? Try the \x1b[1m\x1b[36mnpx gluestack-ui@latest add box\x1b[0m\x1b[0m command and watch the magic happen. ✨`
    );
  }
};
