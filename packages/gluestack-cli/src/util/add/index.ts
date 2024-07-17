import fs from 'fs-extra';
import { basename, join, parse } from 'path';
import os from 'os';
import { log, confirm } from '@clack/prompts';
import {
  cloneRepositoryAtRoot,
  getAllComponents,
  installDependencies,
  projectRootPath,
  removeHyphen,
} from '..';

import { config } from '../../config';
const _homeDir = os.homedir();
let existingComponentsChecked: boolean = false;

const componentAdder = async ({
  requestedComponent = '',
  showWarning = true,
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

        await writeComponent(component, targetPath);
      })
    )
      .then(async () => {
        await installDependencies(updatedComponents);
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

const hookAdder = async ({ requestedHook }: { requestedHook: string }) => {
  try {
    console.log(`\n\x1b[1mAdding new hook...\x1b[0m\n`);
    await cloneRepositoryAtRoot(join(_homeDir, config.gluestackDir));

    await writeHook(requestedHook);
    log.success(
      `\x1b[32mDone!\x1b[0m Added new \x1b[1mgluestack-ui\x1b[0m hook into project`
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const isHookFromConfig = async (hook: string | undefined): Promise<boolean> => {
  const hooksList = fs
    .readdirSync(join(_homeDir, config.gluestackDir, config.hooksResourcePath))
    .map((file) => removeHyphen(parse(file).name));
  if (hook && hooksList.includes(hook.toLowerCase())) return true;
  else return false;
};

const hookFileName = async (hook: string): Promise<string> => {
  const hooksList = fs.readdirSync(
    join(_homeDir, config.gluestackDir, config.hooksResourcePath)
  );
  let fileName = '';
  hooksList.forEach((file) => {
    if (removeHyphen(parse(file).name) == hook.toLowerCase()) {
      fileName = basename(file);
    }
  });
  return fileName;
};
const writeHook = async (hook: string) => {
  const fileName = await hookFileName(hook);
  const utilsPath = join(
    projectRootPath,
    config.writableComponentsPath,
    'utils',
    fileName
  );
  const sourceFilePath = join(
    _homeDir,
    config.gluestackDir,
    config.hooksResourcePath,
    fileName
  );
  if (fs.existsSync(utilsPath)) {
    const confirm = await confirmHookOverride(hook);
    if (confirm === false) {
      processTerminate('Installation aborted');
    }
  }

  try {
    await fs.ensureFile(utilsPath);
    fs.copyFileSync(sourceFilePath, utilsPath);
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
};

const confirmHookOverride = async (hook: string): Promise<boolean | symbol> => {
  const shouldContinue = await confirm({
    message: `\x1b[33mWARNING: ${
      hook[0].toUpperCase() + hook.slice(1)
    } hook already exists. Continuing with the installation may result in hook replacement if changes are made. Please commit your changes before proceeding with the installation. Continue?\x1b[0m`,
  });

  return shouldContinue;
};

export { componentAdder, getAllComponents, isHookFromConfig, hookAdder };
