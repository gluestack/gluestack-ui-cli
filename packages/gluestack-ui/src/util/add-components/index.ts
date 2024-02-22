import fs from 'fs-extra';
import path from 'path';
import { log, isCancel, cancel } from '@clack/prompts';
const { execSync } = require('child_process');

const currDir = process.cwd();
const repoUrl = 'https://github.com/gluestack/gluestack-ui.git';
const componentsPath = 'temp/packages/config/src/components';
let existingComponentsChecked: boolean = false;

const componentAdder = async (
  requestedComponent = '',
  showWarning = true,
  isUpdate = false,
  forceUpdate = false
) => {
  try {
    const tempFolderPath = path.join(currDir, 'temp');
    // await cloneRepository(repoUrl, tempFolderPath);
    const isComponentValid = await checkIfComponentIsValid(requestedComponent);
    if (
      !(
        isComponentValid &&
        requestedComponent !== '' &&
        requestedComponent !== '--all '
      )
    ) {
      log.error(
        '\x1b[32m' +
          `The ${requestedComponent} does not exists. Kindly choose from the below list.` +
          '\x1b[0m'
      );
      return;
    }

    let requestedComponents: string[] = [];
    let addComponents: string[] = [];

    //update the component list if --all is passed
    if (requestedComponent === '--all') {
      requestedComponents = getAllComponents();
    } else {
      requestedComponents.push(requestedComponent);
    }

    // check if the component already exists in the project
    if (
      !existingComponentsChecked &&
      showWarning &&
      requestedComponent !== '' &&
      !forceUpdate
    ) {
      const updatedComponents = await isComponentInConfig(requestedComponents);
      addComponents = [...updatedComponents];
    } else {
      addComponents = requestedComponents;
    }
  } catch (err) {
    console.log('Error:', err);
  }
};

const isComponentInConfig = async (components: string[]): Promise<string[]> => {
  const alreadyExistingComponents: string[] = [];
  let componentsToAdd: any = [];

  for (const component of components) {
    const pathToCheck = path.join(
      currDir,
      'components',
      dashToPascal(component)
    );
    if (fs.existsSync(pathToCheck)) {
      alreadyExistingComponents.push(component);
    }
  }

  if (alreadyExistingComponents.length === 1) {
    const shouldContinue = await confirm(
      `The ${alreadyExistingComponents[0]} component already exists. Be advised that if there are any interdependent components, proceeding will result in their dependent components being replaced as well. Continue installing other components or terminate the installtion?`
    );
    if (isCancel(shouldContinue)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    if (shouldContinue) {
      componentsToAdd = components.filter(
        (component: string) => !alreadyExistingComponents.includes(component)
      );
    }
  }
  existingComponentsChecked = true;
  return componentsToAdd;
};

const getAllComponents = (): string[] => {
  const componentList = fs
    .readdirSync(path.join(currDir, componentsPath))
    .filter(
      (file) =>
        !['.tsx', '.ts', '.jsx', '.js'].includes(
          path.extname(file).toLowerCase()
        )
    );
  return componentList;
};

const checkIfComponentIsValid = async (component: string): Promise<boolean> => {
  const componentList = getAllComponents();
  if (
    componentList.includes(component) ||
    componentList.includes(dashToPascal(component))
  ) {
    return true;
  }
  return false;
};

const dashToPascal = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/-(.)/g, (_, group1) => group1.toUpperCase())
    .replace(/(^|-)([a-z])/g, (_, _group1, group2) => group2.toUpperCase());
};

const getConfigComponentPath = () => {
  if (!fs.existsSync(path.join(currDir, 'gluestack-ui.config.ts'))) {
    return '';
  }
  const configFile = fs.readFileSync(
    path.join(currDir, 'gluestack-ui.config.ts'),
    'utf-8'
  );
  const match = configFile.match(/componentPath:\s+(['"])(.*?)\1/);
  const componentPath = (match && match[2]) ?? '';
  return componentPath;
};

const cloneRepository = async (repoUrl: string, destinationPath: string) => {
  try {
    await execSync(`git clone ${repoUrl} ${destinationPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

async function deleteClonedRepository(clonedRepoPath: string) {
  try {
    await execSync(`rm -rf ${clonedRepoPath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

export { componentAdder };
