import fs from 'fs-extra';
import path from 'path';
import { log, isCancel, cancel, confirm, spinner } from '@clack/prompts';
import os from 'os';
import { cloneRepositoryAtRoot } from '..';
const { execSync } = require('child_process');

const homeDir = os.homedir();
const currDir = process.cwd();
const componentsPath = 'packages/config/src/components';
const writableComponentsPath = 'components';
const gluestackDir = path.join(homeDir, '.gluestack', 'cache', 'gluestack-ui');
let existingComponentsChecked: boolean = false;

const componentAdder = async ({
  requestedComponent = '',
  showWarning = true,
  forceUpdate = false,
}) => {
  try {
    await cloneRepositoryAtRoot();
    if (
      requestedComponent &&
      requestedComponent !== '--all' &&
      !(await checkIfComponentIsValid(requestedComponent))
    ) {
      log.error(
        '\x1b[32m' +
          `The ${requestedComponent} does not exist. Kindly choose from the below list.` +
          '\x1b[0m'
      );
      return;
    }

    let requestedComponents =
      requestedComponent === '--all'
        ? getAllComponents()
        : [requestedComponent];

    const updatedComponents =
      !existingComponentsChecked &&
      showWarning &&
      requestedComponent &&
      !forceUpdate
        ? await isComponentInConfig(requestedComponents)
        : requestedComponents;

    await Promise.all(
      updatedComponents.map(async (component) => {
        const targetPath = path.join(
          currDir,
          writableComponentsPath,
          component
        );
        await writeComponent(component, targetPath);
        addIndexFile(path.join(currDir, writableComponentsPath));
      })
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const isComponentInConfig = async (components: string[]): Promise<string[]> => {
  const alreadyExistingComponents: string[] = [];
  let componentsToAdd: any = [];
  for (const component of components) {
    const pathToCheck = path.join(
      gluestackDir,
      componentsPath,
      dashToPascal(component)
    );
    if (fs.existsSync(pathToCheck)) {
      alreadyExistingComponents.push(component);
    }
  }

  //confirm about the already existing components
  if (alreadyExistingComponents.length === 1) {
    const shouldContinue = await confirm({
      message: `The ${alreadyExistingComponents[0]} component already exists. Be advised that if there are any changes made in the components, proceeding will result in components being replaced as well. Continue installing component?`,
    });
    if (isCancel(shouldContinue)) {
      log.warning('Operation cancelled.');
      cancel('Operation cancelled.');
      process.exit(0);
    }
    componentsToAdd = shouldContinue
      ? components.filter(
          (component) => !alreadyExistingComponents.includes(component)
        )
      : [];
  } else {
    componentsToAdd = components;
  }
  existingComponentsChecked = true;
  return componentsToAdd;
};

const getAllComponents = (): string[] => {
  const componentList = fs
    .readdirSync(path.join(gluestackDir, componentsPath))
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
  )
    return true;
  else return false;
};

const dashToPascal = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/-(.)/g, (_, group1) => group1.toUpperCase())
    .replace(/(^|-)([a-z])/g, (_, _group1, group2) => group2.toUpperCase());
};

const writeComponent = async (component: string, targetPath: string) => {
  try {
    // Ensure the destination folder exists or create it
    await fs.ensureDir(targetPath);
    await fs.copy(
      path.join(gluestackDir, componentsPath, component),
      targetPath,
      {
        overwrite: true,
      }
    );
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
};

const addIndexFile = async (componentsDirectory: string) => {
  try {
    const directories = await fs.readdir(componentsDirectory);
    const componentDirectories = directories.filter((item) =>
      fs.statSync(path.join(componentsDirectory, item)).isDirectory()
    );
    // Generate import and export statements for each component directory
    const importStatements = componentDirectories
      .map(
        (componentName) =>
          `import * as ${componentName} from './${componentName}';`
      )
      .join('\n');
    const exportStatements = componentDirectories
      .map(
        (componentName) =>
          `export {${componentName}} from './${componentName}';`
      )
      .join('\n');
    // Combine import and export statements
    const indexContent = `${importStatements}\n${exportStatements}`;
    await fs.writeFile(
      path.join(componentsDirectory, 'index.ts'),
      indexContent
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const cloneRepository = async (repoUrl: string, destinationPath: string) => {
  try {
    const s = spinner();
    s.start('Cloning repository...');
    await execSync(`git clone ${repoUrl} ${destinationPath}`);
    s.stop('Repository cloned successfully.');
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
};

async function deleteClonedRepository(clonedRepoPath: string) {
  try {
    const s = spinner();
    s.start('Cleaning up...');
    await execSync(`rm -rf ${clonedRepoPath}`);
    s.stop('Clean up complete.');
  } catch (error) {
    log.error(`\x1b[31mError: ${(error as Error).message}\x1b[0m`);
  }
}

export { componentAdder };
