import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { log, confirm } from '@clack/prompts';
import { addIndexFile, cloneRepositoryAtRoot, getAllComponents } from '..';
import {
  generateConfigAndInstallDependencies,
  getComponentStyle,
} from '../create-config';
import { config } from '../../config';
const currDir = process.cwd();
const homeDir = os.homedir();
let existingComponentsChecked: boolean = false;

const componentAdder = async ({
  requestedComponent = '',
  showWarning = true,
  installationMethod = '',
}) => {
  try {
    await cloneRepositoryAtRoot();
    await getComponentStyle();
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
        const targetPath = path.join(
          currDir,
          config.writableComponentsPath,
          component
        );

        await writeComponent(component, targetPath);
        addIndexFile(path.join(currDir, config.writableComponentsPath));
      })
    )
      .then(async () => {
        await generateConfigAndInstallDependencies({
          rootDir: path.join(currDir, config.writableComponentsPath),
          installationMethod: installationMethod,
        });
        log.success('Installation completed');
      })
      .catch((err) => {
        log.error(`\x1b[31mError : ${(err as Error).message}\x1b[0m`);
      });
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const checkIfDirectoryExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false; // Directory does not exist or there was an error accessing it
  }
};

const isComponentInConfig = async (components: string[]): Promise<string[]> => {
  const alreadyExistingComponents: string[] = [];
  let componentsToAdd: any = [];
  for (const component of components) {
    const pathToCheck = path.join(
      currDir,
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
    // Ensure the destination folder exists or create it
    await fs.ensureDir(targetPath);
    await fs.copy(
      path.join(
        homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style,
        component
      ),
      path.join(targetPath),

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
  const shouldContinue = await confirm({
    message: `${displayComponent} component/components already exists. Be advised that if there are any changes made in the components, proceeding will result in components being replaced as well. Continue installing component?`,
  });
  return shouldContinue;
};

export { componentAdder, getAllComponents };
