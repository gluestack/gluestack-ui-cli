import fs from 'fs-extra';
import path from 'path';
import { componentAdder } from '../component-adder';
import { getConfigComponentPath, pascalToDash } from '../utils';
import { isCancel, cancel, confirm, log } from '@clack/prompts';
import os from 'os';

const homeDir = os.homedir();
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
      const cliComponent = pascalToDash(component);
      requestedComponents.push(cliComponent);
    }
  });

  return requestedComponents;
};

const getComponentsList = async (): Promise<Array<string>> => {
  const sourcePath = path.join(
    homeDir,
    '.gluestack',
    'cache',
    'gluestack-ui',
    'example',
    'storybook',
    'src',
    'ui-components'
  );
  return fs.readdirSync(sourcePath);
};

const checkIfComponentIsValid = async (component: string): Promise<boolean> => {
  const componentList = await getComponentsList();

  if (componentList.includes(component)) {
    return true;
  }
  return false;
};

async function updateComponent(component = ''): Promise<void> {
  try {
    const componentPath = getConfigComponentPath();

    const dirPath = path.resolve(
      process.cwd(),
      componentPath,
      'core',
      component
    );
    if (!(await checkIfComponentIsValid(component))) {
      log.error(`\x1b[33mComponent "${component}" not found.\x1b[0m`);
      process.exit(0);
    }

    if (component === '--all') {
      const source = path.resolve(process.cwd(), componentPath, 'core');
      const requestedComponents = getAllComponents(source);
      for (const component of requestedComponents) {
        await componentAdder(component, false, true);
      }
    } else {
      const shouldContinue = await confirm({
        message: `Are you sure you want to update ${component} ? This will remove all your existing changes and replace them with new.`,
      });

      if (isCancel(shouldContinue)) {
        cancel('Operation cancelled.');
        process.exit(0);
      }

      if (shouldContinue) {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        } else {
          log.error(`\x1b[33mComponent "${component}" not found.\x1b[0m`);

          return;
        }
        await componentAdder(component, false, true);
      } else {
        log.error(
          `\x1b[33mThe update of component "${component}" has been canceled.\x1b[0m`
        );
      }
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
}

export { updateComponent };
