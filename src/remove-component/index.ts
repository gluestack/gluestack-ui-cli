import fs from 'fs-extra';
import path from 'path';
import { addIndexFile, getConfigComponentPath } from '../utils';
import { isCancel, cancel, confirm, log } from '@clack/prompts';

const currDir = process.cwd();

const getAllComponents = (source: string): string[] => {
  const requestedComponents: string[] = [];

  fs.readdirSync(source).forEach((component: string) => {
    if (
      !(
        component === 'index.ts' ||
        component === 'index.tsx' ||
        component === 'GluestackUIProvider' ||
        component === 'styled'
      )
    ) {
      requestedComponents.push(component);
    }
  });

  return requestedComponents;
};

const updateIndexFile = async (dirPath: string, componentPath: string) => {
  const indexPath = path.resolve(dirPath, 'index.ts');
  fs.rmSync(indexPath);
  const targetPath = path.join(currDir, componentPath, 'core');
  addIndexFile(targetPath, 1);
};

async function removeComponent(component = '') {
  try {
    const componentPath = getConfigComponentPath();

    const dirPath = path.resolve(currDir, componentPath, 'core');
    const componentsPath = path.resolve(
      currDir,
      componentPath,
      'core',
      component
    );

    if (component === '--all') {
      const requestedComponents = getAllComponents(dirPath);
      for (const component of requestedComponents) {
        const componentsPath = path.resolve(
          currDir,
          componentPath,
          'core',
          component
        );
        fs.rmSync(componentsPath, { recursive: true, force: true });
        log.success(
          `\x1b[32m✅  ${'\u001b[1m' +
            component +
            '\u001b[22m'} \x1b[0m component removed successfully!`
        );
      }
      //  Update index file
      await updateIndexFile(dirPath, componentPath);
    } else {
      const shouldContinue = await confirm({
        message: `Are you sure you want to remove ${component}?`,
      });

      if (isCancel(shouldContinue)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      if (shouldContinue) {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(componentsPath, { recursive: true, force: true });
          log.success(
            `\x1b[32m✅  ${'\u001b[1m' +
              component +
              '\u001b[22m'} \x1b[0m component removed successfully!`
          );

          //  Update index file
          await updateIndexFile(dirPath, componentPath);
        } else {
          log.error(`\x1b[33mComponent "${component}" not found.\x1b[0m`);
        }
      } else {
        log.error(
          `\x1b[33mThe removal of component "${component}" has been canceled.\x1b[0m`
        );
      }
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
}

export { removeComponent };
