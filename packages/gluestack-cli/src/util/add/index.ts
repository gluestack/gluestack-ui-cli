import { confirm, log } from '@clack/prompts';
import fs from 'fs-extra';
import os from 'os';
import { join } from 'path';
import {
  addDependencies,
  cloneRepositoryAtRoot,
  getAllComponents,
  projectRootPath,
} from '..';

import { config } from '../../config';
const _homeDir = os.homedir();
let existingComponentsChecked: boolean = false;

const componentAdder = async ({
  requestedComponent = '',
  showWarning = true,
  installationMethod = '',
}) => {
  try {
    console.log(`\n\x1b[1mAdding new component...\x1b[0m\n`);
    await cloneRepositoryAtRoot(join(_homeDir, config.gluestackDir));
    //currently since nativewind is default, we are not checking for the existing component style
    // await getExistingComponentStyle();
    if (
      requestedComponent &&
      requestedComponent !== '--all' &&
      !(await checkIfComponentIsValid(requestedComponent))
    ) {
      log.error(
        `\x1b[31mThe ${requestedComponent} does not exist. Kindly choose a valid component name.\x1b[0m `
      );
      return;
    }

    let requestedComponents =
      requestedComponent === '--all'
        ? getAllComponents()
        : [requestedComponent];

    const updatedComponents =
      !existingComponentsChecked && showWarning && requestedComponent
        ? await isComponentInConfig(requestedComponents)
        : requestedComponents;

    await Promise.all(
      updatedComponents.map(async (component) => {
        const targetPath = join(
          projectRootPath,
          config.writableComponentsPath,
          component
        );
        console.log(`writing component`, component, targetPath);
        await writeComponent(component, targetPath);
      })
    )
      .then(async () => {
        await addDependencies(installationMethod, updatedComponents);
        log.success(
          `\x1b[32mDone!\x1b[0m Added new \x1b[1mgluestack-ui\x1b[0m component into project`
        );
      })
      .catch((err) => {
        log.error(`\x1b[31mError : ${(err as Error).message}\x1b[0m`);
      });
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const isComponentInConfig = async (components: string[]): Promise<string[]> => {
  const alreadyExistingComponents: string[] = [];
  let componentsToAdd: any = [];
  for (const component of components) {
    const pathToCheck = join(
      projectRootPath,
      config.writableComponentsPath,
      component
    );
    if (fs.existsSync(pathToCheck)) {
      alreadyExistingComponents.push(component);
    }
  }
  //confirm about the already existing components
  if (
    alreadyExistingComponents.length === 1 ||
    alreadyExistingComponents.length > 1
  ) {
    const shouldContinue = await confirmOverride(
      alreadyExistingComponents,
      alreadyExistingComponents.length
    );

    //code to remove already existing components from the list
    componentsToAdd = shouldContinue
      ? components.filter(
          (component) => !alreadyExistingComponents.includes(component)
        )
      : processTerminate('Installation aborted');
    if (shouldContinue) {
      componentsToAdd = components;
    } else {
      componentsToAdd = [];
    }
  } else {
    componentsToAdd = components;
  }

  if (componentsToAdd.length === 0) log.error('No components to be added');
  existingComponentsChecked = true;
  return componentsToAdd;
};

const processTerminate = (message: string) => {
  log.error(message);
  process.exit(1);
};

const checkIfComponentIsValid = async (component: string): Promise<boolean> => {
  const componentList = getAllComponents();
  if (componentList.includes(component) || componentList.includes(component))
    return true;
  else return false;
};

const writeComponent = async (component: string, targetPath: string) => {
  try {
    await fs.ensureDir(targetPath);
    await fs.copy(
      join(
        _homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style,
        component
      ),
      join(targetPath),

      {
        overwrite: true,
      }
    );
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
};

const confirmOverride = async (
  component: string[],
  existingCount: number
): Promise<boolean | symbol> => {
  const displayComponent = existingCount === 1 ? component[0] : 'Few';
  const components = existingCount === 1 ? 'component' : 'components';
  const shouldContinue = await confirm({
    message: `\x1b[33mWARNING: ${
      displayComponent[0].toUpperCase() + displayComponent.slice(1)
    } ${components} already exists. Continuing with the installation may result in component replacement if changes are made. Please commit your changes before proceeding with the installation. Continue?\x1b[0m`,
  });

  return shouldContinue;
};

export { componentAdder, getAllComponents };
