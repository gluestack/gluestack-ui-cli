import fs from 'fs-extra';
import path from 'path';
import process from 'process';
import util from 'util';
import os from 'os';
import {
  cloneComponentRepo,
  pullComponentRepo,
  checkIfFolderExists,
} from './utils';
import {
  getConfigComponentPath,
  addIndexFile,
  pascalToDash,
  dashToPascal,
  getPackageJsonPath,
} from '../utils';

import {
  isCancel,
  cancel,
  confirm,
  multiselect,
  spinner,
  log,
} from '@clack/prompts';

const currDir = process.cwd();

const rootPackageJsonPath: string = getPackageJsonPath();

const homeDir = os.homedir();
const copyAsync = util.promisify(fs.copy);

let existingComponentsChecked: boolean = false;

const copyFolders = async (
  sourcePath: string,
  targetPath: string,
  specificComponent: string,
  isUpdate: boolean
): Promise<void> => {
  const groupedComponents: Record<string, string[]> = {};
  let specificComponentType: string | undefined;

  //  Traverse all components
  try {
    fs.readdirSync(sourcePath).forEach((component: string) => {
      if (
        component !== 'index.ts' &&
        component !== 'index.tsx' &&
        component !== 'Provider'
      ) {
        // Read in the existing package.json file
        const packageJsonPath = path.join(sourcePath, component, 'config.json');

        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf8')
        );
        let componentType: string | undefined;

        if (packageJson.keywords.indexOf('components') !== -1) {
          componentType = packageJson.keywords[1];
        }

        if (componentType) {
          const cliComponent = pascalToDash(component);
          groupedComponents[componentType] =
            groupedComponents[componentType] || [];
          groupedComponents[componentType].push(cliComponent);
        }

        const sourceComponent = pascalToDash(component);

        if (sourceComponent.toLowerCase() === specificComponent.toLowerCase()) {
          specificComponentType = componentType;
        }
      }
    });
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return;
  }

  let selectedComponents: any = {};
  // Ask component type
  if (!specificComponentType) {
    const selectedComponentType = await multiselect({
      message: 'Select the type of components:',
      options: Object.keys(groupedComponents).map(type => {
        return { value: type, label: type };
      }),
      required: true,
    });
    if (isCancel(selectedComponentType)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    if (Array.isArray(selectedComponentType)) {
      await Promise.all(
        selectedComponentType.map(async (component: any) => {
          if (groupedComponents[component].length !== 0) {
            const selectComponents = await multiselect({
              message: `Select ${component} components:`,
              options: groupedComponents[component].map(type => {
                return { value: type, label: type };
              }),
              required: true,
            });
            if (isCancel(selectComponents)) {
              cancel('Operation cancelled.');
              process.exit(0);
            }
            selectedComponents[component] = selectComponents;
          } else {
            log.error(
              `\x1b[31mError: No components of ${component} type!\x1b[0m`
            );
          }
        })
      );
    }
  } else {
    selectedComponents[specificComponentType] = [specificComponent];
  }

  await Promise.all(
    Object.keys(selectedComponents).map(component => {
      // createFolders(path.join(targetPath, component));
      selectedComponents[component].map((subcomponent: any) => {
        // Add Packages
        const originalComponentPath = dashToPascal(subcomponent);

        const compPackageJsonPath = path.join(
          sourcePath,
          originalComponentPath,
          'config.json'
        );

        const compPackageJson = JSON.parse(
          fs.readFileSync(compPackageJsonPath, 'utf8')
        );

        if (
          compPackageJson.componentDependencies &&
          compPackageJson.componentDependencies.length > 0
        ) {
          compPackageJson.componentDependencies.map(
            async (component: string) => {
              await componentAdder(component, false, true);
            }
          );
        }

        const rootPackageJson = JSON.parse(
          fs.readFileSync(rootPackageJsonPath, 'utf8')
        );

        rootPackageJson.dependencies = {
          ...rootPackageJson.dependencies,
          ...compPackageJson.dependencies,
        };

        fs.writeFileSync(
          rootPackageJsonPath,
          JSON.stringify(rootPackageJson, null, 2)
        );

        // createFolders(path.join(targetPath, component, originalComponentPath));

        fs.copySync(
          path.join(sourcePath, originalComponentPath),
          path.join(targetPath, component, originalComponentPath)
        );

        if (
          fs.existsSync(
            path.join(
              targetPath,
              component,
              originalComponentPath,
              'config.json'
            )
          )
        ) {
          fs.unlinkSync(
            path.join(
              targetPath,
              component,
              originalComponentPath,
              'config.json'
            )
          );
        }

        if (!isUpdate) {
          log.success(
            `\x1b[32m✅  ${'\u001b[1m' +
              originalComponentPath +
              '\u001b[22m'} \x1b[0m component added successfully!`
          );
        } else {
          log.success(
            `\x1b[32m✅  ${'\u001b[1m' +
              originalComponentPath +
              '\u001b[22m'} \x1b[0m component updated successfully!`
          );
        }
      });
    })
  );
};

const checkForExistingFolders = async (
  specificComponents: string[]
): Promise<string[]> => {
  const alreadyExistingComponents: string[] = [];
  let selectedComponents: any = [];

  for (const component of specificComponents) {
    const componentPath = getConfigComponentPath();
    const pathToCheck = path.join(
      currDir,
      componentPath,
      'core',
      dashToPascal(component)
    );
    if (fs.existsSync(pathToCheck)) {
      alreadyExistingComponents.push(component);
    }
  }

  if (alreadyExistingComponents.length === 1) {
    const shouldContinue = await confirm({
      message: `The ${alreadyExistingComponents[0]} component already exists. Kindly proceed if you wish to replace. Be advised that if there are any interdependent components, proceeding will result in their dependent components being replaced as well.`,
    });
    if (isCancel(shouldContinue)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
    if (shouldContinue) {
      selectedComponents = alreadyExistingComponents;
    }
  } else if (alreadyExistingComponents.length > 0) {
    selectedComponents = await multiselect({
      message: `The following components already exists. Kindly choose the ones you wish to replace. Be advised that if there are any interdependent components, selecting them for replacement will result in their dependent components being replaced as well.`,
      options: alreadyExistingComponents.map(component => ({
        label: component,
        value: component,
      })),
    });
    if (isCancel(selectedComponents)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // Remove repeated components from all components
  const filteredComponents = specificComponents.filter(
    component => !alreadyExistingComponents.includes(component)
  );

  // Add selected components to all components
  const updatedComponents = filteredComponents.concat(selectedComponents);
  existingComponentsChecked = true;
  return updatedComponents;
};

const getAllComponents = (source: string): string[] => {
  const requestedComponents: string[] = [];

  fs.readdirSync(source).forEach((component: string) => {
    if (
      !(
        component === 'index.ts' ||
        component === 'index.tsx' ||
        component === 'Provider'
      )
    ) {
      const packageJsonPath = path.join(source, component, 'config.json');

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      let componentType;
      if (packageJson.keywords.indexOf('components') !== -1) {
        componentType = packageJson.keywords[1];
      }
      if (componentType) {
        const cliComponent = pascalToDash(component);
        requestedComponents.push(cliComponent);
      }
    }
  });

  return requestedComponents;
};

const componentAdder = async (
  requestedComponent = '',
  showWarning = true,
  isUpdate = false
) => {
  try {
    // Get config
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

    let requestedComponents: string[] = [];
    let addComponents: string[] = [];

    if (requestedComponent === '--all') {
      requestedComponents = getAllComponents(sourcePath);
    } else {
      requestedComponents.push(requestedComponent);
    }

    if (
      !existingComponentsChecked &&
      showWarning &&
      requestedComponent !== ''
    ) {
      const updatedComponents = await checkForExistingFolders(
        requestedComponents
      );
      addComponents = [...updatedComponents];
    } else {
      addComponents = requestedComponents;
    }
    await Promise.all(
      addComponents.map(async component => {
        const componentPath = getConfigComponentPath();
        // createFolders(path.join(currDir, componentPath));
        const targetPath = path.join(currDir, componentPath);
        await copyFolders(sourcePath, targetPath, component, isUpdate);
        addIndexFile(targetPath);
      })
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const addConfig = async (sourcePath: string, configTargetPath: string) => {
  try {
    // Copy Gluestack UI config to root
    const gluestackConfig = await fs.readFile(
      path.resolve(sourcePath, '../', 'gluestack-ui.config.ts'),
      'utf8'
    );

    await fs.writeFile(
      path.join(configTargetPath, 'gluestack-ui.config.ts'),
      gluestackConfig
    );
  } catch (err) {
    log.error(JSON.stringify(err));
  }
};

const updateConfig = async (
  componentFolderPath: string,
  configTargetPath: string
) => {
  try {
    // Update Gluestack UI config file
    const configFile = await fs.readFile(
      path.join(configTargetPath, 'gluestack-ui.config.ts'),
      'utf8'
    );

    // const folderName = path.relative(currDir, targetPath);

    const newConfig = configFile.replace(
      /componentPath:\s+'[^']+'/,
      `componentPath: '${componentFolderPath}'`
    );
    fs.writeFileSync(
      path.join(configTargetPath, 'gluestack-ui.config.ts'),
      newConfig
    );
    log.success(
      `\x1b[32m✅  ${'\u001b[1m' +
        'GluestackUIProvider' +
        '\u001b[22m'} \x1b[0m added successfully!`
    );
  } catch (err) {
    log.error(JSON.stringify(err));
  }
};

const addProvider = async (sourcePath: string, targetPath: string) => {
  try {
    // Copy Provider and styled folder
    await copyAsync(
      path.join(sourcePath, 'Provider'),
      path.join(targetPath, 'core', 'GluestackUIProvider')
    );
    await copyAsync(
      path.join(sourcePath, 'styled'),
      path.join(targetPath, 'core', 'styled')
    );

    // Delete config.json files
    fs.unlinkSync(
      path.join(targetPath, 'core', 'GluestackUIProvider', 'config.json')
    );
    fs.unlinkSync(path.join(targetPath, 'core', 'styled', 'config.json'));

    // Update Provider Config Path
    // const providerIndexFile = await fs.readFile(
    //   path.join(targetPath, 'core', 'GluestackUIProvider', 'index.tsx'),
    //   'utf8'
    // );
    // const modifiedProviderIndexFile = providerIndexFile.replace(
    //   './gluestack-ui.config',
    //   path
    //     .relative(
    //       path.join(targetPath, 'core', 'GluestackUIProvider', 'index.tsx'),
    //       path.join(currDir, 'gluestack-ui.config')
    //     )
    //     .slice(3)
    // );
    // fs.writeFileSync(
    //   path.join(targetPath, 'core', 'GluestackUIProvider', 'index.tsx'),
    //   modifiedProviderIndexFile
    // );
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const getComponentGitRepo = async (): Promise<void> => {
  try {
    // Clone repo locally in users home directory
    const cloneLocation = path.join(homeDir, '.gluestack', 'cache');
    const clonedPath = path.join(cloneLocation, 'gluestack-ui');
    const clonedRepoExists = await checkIfFolderExists(clonedPath);

    if (clonedRepoExists) {
      log.step('Repository already cloned.');
      await pullComponentRepo(clonedPath);
    } else {
      const s = spinner();
      s.start('Cloning repository...');
      // createFolders(cloneLocation);
      await cloneComponentRepo(
        clonedPath,
        'https://github.com/gluestack/gluestack-ui.git'
      );
      s.stop('Repository cloned successfully.');
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const initialProviderAdder = async (
  componentFolderPath: string,
  projectType: string
): Promise<void> => {
  try {
    // createFolders(path.join(currDir, componentFolderPath));

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

    const targetPath = path.join(currDir, componentFolderPath);
    let configTargetPath = currDir;
    if (projectType === 'Unknown') {
      configTargetPath = path.join(currDir, 'src');
    }
    await addProvider(sourcePath, targetPath);
    await addConfig(sourcePath, configTargetPath);
    await updateConfig(componentFolderPath, configTargetPath);
    addIndexFile(targetPath);
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

export { componentAdder, initialProviderAdder, getComponentGitRepo };
