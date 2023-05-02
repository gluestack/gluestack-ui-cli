import fs from 'fs-extra';
import prompts from 'prompts';
import path from 'path';
import process from 'process';
import util from 'util';
import os from 'os';
import {
  cloneComponentRepo,
  createFolders,
  pullComponentRepo,
  checkIfFolderExists,
} from './utils';

const homeDir = os.homedir();
const currDir = process.cwd();
const copyAsync = util.promisify(fs.copy);

let existingComponentsChecked: boolean = false;
let componentsToBeAdded: string[] = [];

const addIndexFile = async (componentsDirectory: string, level = 0) => {
  try {
    fs.readdir(componentsDirectory, (err: any, files: string[]) => {
      if (err) {
        console.error('\x1b[31m%s\x1b[0m', err.message);
        throw err;
      }

      const exports = files
        .filter(
          file =>
            file !== 'index.js' && file !== 'index.tsx' && file !== 'index.ts'
        )
        .map(file => {
          if (level === 0) {
            addIndexFile(`${componentsDirectory}/${file}`, level + 1);
          }
          return `export * from './${file.split('.')[0]}';`;
        })
        .join('\n');

      fs.writeFile(
        path.join(componentsDirectory, 'index.ts'),
        exports,
        (err: any) => {
          if (err) {
            console.error('\x1b[31m%s\x1b[0m', err.message);
            throw err;
          }
        }
      );
    });
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${(error as Error).message}`);
  }
};

const pascalToDash = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

const dashToPascal = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/-(.)/g, (_, group1) => group1.toUpperCase())
    .replace(/(^|-)([a-z])/g, (_, _group1, group2) => group2.toUpperCase());
};

const copyFolders = async (
  sourcePath: string,
  targetPath: string,
  specificComponent: string
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
        const packageJsonPath = `${sourcePath}/${component}/config.json`;
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
  } catch (error) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `Error occurred while reading config files: ${(error as Error).message}`
    );
    return;
  }

  let selectedComponents: Record<string, string[]> = {};
  // Ask component type
  if (!specificComponentType) {
    const selectedComponentType = await prompts({
      type: 'multiselect',
      name: 'componentType',
      message: `Select the type of components:`,
      choices: Object.keys(groupedComponents).map(type => {
        return { title: type, value: type };
      }),
    });
    if (selectedComponentType.componentType) {
      await Promise.all(
        selectedComponentType.componentType.map(async (component: string) => {
          if (groupedComponents[component].length !== 0) {
            const selectComponents = await prompts({
              type: 'multiselect',
              name: 'components',
              message: `Select ${component} components:`,
              choices: groupedComponents[component].map(type => {
                return { title: type, value: type };
              }),
            });
            selectedComponents[component] = selectComponents.components;
          } else {
            console.log(`No components of ${component} type!`);
          }
        })
      );
    }
  } else {
    selectedComponents[specificComponentType] = [specificComponent];
  }

  await Promise.all(
    Object.keys(selectedComponents).map(component => {
      createFolders(`${targetPath}/${component}`);
      selectedComponents[component].map(subcomponent => {
        // Add Packages
        const originalComponentPath = dashToPascal(subcomponent);

        const compPackageJsonPath = `${sourcePath}/${originalComponentPath}/config.json`;

        const compPackageJson = JSON.parse(
          fs.readFileSync(compPackageJsonPath, 'utf8')
        );

        if (
          compPackageJson.componentDependencies &&
          compPackageJson.componentDependencies.length > 0
        ) {
          compPackageJson.componentDependencies.map(
            async (component: string) => {
              await componentAdder(component);
            }
          );
        }

        const rootPackageJsonPath = `${currDir}/package.json`;
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

        createFolders(`${targetPath}/${component}/${originalComponentPath}`);
        fs.copySync(
          `${sourcePath}/${originalComponentPath}`,
          `${targetPath}/${component}/${originalComponentPath}`
        );

        if (
          fs.existsSync(
            `${targetPath}/${component}/${originalComponentPath}/config.json`
          )
        ) {
          fs.unlinkSync(
            `${targetPath}/${component}/${originalComponentPath}/config.json`
          );
        }

        console.log(
          ` \x1b[32m ✔  ${'\u001b[1m' +
            originalComponentPath +
            '\u001b[22m'} \x1b[0m component added successfully!`
        );
      });
    })
  );
};

const checkForExistingFolders = async (specificComponents: string[]) => {
  const alreadyExistingComponents: string[] = [];
  let selectedComponents: string[] = [];

  for (const component of specificComponents) {
    const configFile = fs.readFileSync(
      `${currDir}/gluestack-ui.config.ts`,
      'utf-8'
    );

    const match = configFile.match(/componentPath:\s+'([^']+)'/);
    const componentPath = (match && match[1]) ?? '';
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
    const response = await prompts({
      type: 'text',
      name: 'value',
      message: `The ${alreadyExistingComponents[0]} component already exists. Kindly proceed if you wish to replace. Be advised that if there are any interdependent components, proceeding will result in their dependent components being replaced as well.`,
      initial: 'y',
    });
    if (response.value.toLowerCase() === 'y') {
      selectedComponents = alreadyExistingComponents;
    }
  } else if (alreadyExistingComponents.length > 0) {
    const response = await prompts({
      type: 'multiselect',
      name: 'value',
      message: `The following components already exists. Kindly choose the ones you wish to replace. Be advised that if there are any interdependent components, selecting them for replacement will result in their dependent components being replaced as well.`,
      choices: alreadyExistingComponents.map(component => ({
        title: component,
        value: component,
      })),
    });
    selectedComponents = response.value;
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

const componentAdder = async (requestedComponent = '') => {
  try {
    // Get config
    const sourcePath = `${homeDir}/.gluestack/cache/gluestack-ui/example/storybook/src/ui-components`;

    const requestedComponents: string[] = [];
    const groupedComponents: Record<string, string[]> = {};
    let addComponents: string[] = [];

    if (requestedComponent === '--all') {
      fs.readdirSync(sourcePath).forEach((component: string) => {
        if (
          !(
            component === 'index.ts' ||
            component === 'index.tsx' ||
            component === 'Provider'
          )
        ) {
          const packageJsonPath = `${sourcePath}/${component}/config.json`;
          const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, 'utf8')
          );
          let componentType;
          if (packageJson.keywords.indexOf('components') !== -1) {
            componentType = packageJson.keywords[1];
          }
          if (componentType) {
            const cliComponent = pascalToDash(component);
            groupedComponents[componentType] =
              groupedComponents[componentType] || [];
            groupedComponents[componentType].push(cliComponent);
            requestedComponents.push(cliComponent);
          }
        }
      });
    } else {
      requestedComponents.push(requestedComponent);
    }

    if (!existingComponentsChecked) {
      componentsToBeAdded = await checkForExistingFolders(requestedComponents);
      addComponents = [...componentsToBeAdded];
    } else {
      // addComponents = requestedComponents.filter(element =>
      //   componentsToBeAdded.includes(pascalToDash(element))
      // );
      addComponents = requestedComponents;
    }
    await Promise.all(
      addComponents.map(async component => {
        const configFile = fs.readFileSync(
          `${currDir}/gluestack-ui.config.ts`,
          'utf-8'
        );

        const match = configFile.match(/componentPath:\s+'([^']+)'/);
        const componentPath = (match && match[1]) ?? '';
        createFolders(path.join(currDir, componentPath));
        const targetPath = path.join(currDir, componentPath);
        await copyFolders(sourcePath, targetPath, component);
        await addIndexFile(targetPath);
      })
    );
  } catch (err) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'Error adding components:',
      (err as Error).message
    );
  }
};

const addProvider = async (sourcePath: string, targetPath: string) => {
  try {
    // Create necessary folders
    createFolders(`${targetPath}/core`);
    createFolders(`${targetPath}/core/GluestackUIProvider`);
    createFolders(`${targetPath}/core/styled`);

    // Copy Provider and styled folder
    await copyAsync(
      `${sourcePath}/Provider`,
      `${targetPath}/core/GluestackUIProvider`
    );
    await copyAsync(`${sourcePath}/styled`, `${targetPath}/core/styled`);

    // Copy Gluestack UI config to root
    const gluestackConfig = await fs.readFile(
      path.resolve(sourcePath, '../', 'gluestack-ui.config.ts'),
      'utf8'
    );
    await fs.writeFile(`${currDir}/gluestack-ui.config.ts`, gluestackConfig);

    // Delete config.json files
    fs.unlinkSync(`${targetPath}/core/GluestackUIProvider/config.json`);
    fs.unlinkSync(`${targetPath}/core/styled/config.json`);

    // Update Provider Config Path
    const providerIndexFile = await fs.readFile(
      `${targetPath}/core/GluestackUIProvider/index.tsx`,
      'utf8'
    );
    const modifiedProviderIndexFile = providerIndexFile.replace(
      './gluestack-ui.config',
      path
        .relative(
          `${targetPath}/core/GluestackUIProvider/index.tsx`,
          `${currDir}/gluestack-ui.config`
        )
        .slice(3)
    );
    fs.writeFileSync(
      `${targetPath}/core/GluestackUIProvider/index.tsx`,
      modifiedProviderIndexFile
    );

    // Update Gluestack UI config file
    const configFile = await fs.readFile(
      `${currDir}/gluestack-ui.config.ts`,
      'utf8'
    );
    const folderName = targetPath.split('/').slice(-1)[0];
    const newConfig = configFile.replace(
      /componentPath:\s+'[^']+'/,
      `componentPath: './${folderName}'`
    );
    fs.writeFileSync(`${currDir}/gluestack-ui.config.ts`, newConfig);
    console.log(
      '\x1b[32m%s\x1b[0m',
      'gluestack-ui provider added successfully!'
    );
  } catch (err) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'Error while adding gluestack-ui provider:',
      (err as Error).message
    );
  }
};

const getComponentGitRepo = async (): Promise<void> => {
  try {
    // Clone repo locally in users home directory
    const cloneLocation = `${homeDir}/.gluestack/cache`;
    const clonedPath = `${cloneLocation}/gluestack-ui`;
    const clonedRepoExists = await checkIfFolderExists(clonedPath);

    if (clonedRepoExists) {
      console.log('gluestack-ui repository already cloned.');
      await pullComponentRepo(clonedPath);
    } else {
      console.log('Cloning gluestack-ui repository...');
      createFolders(cloneLocation);
      await cloneComponentRepo(
        clonedPath,
        'https://github.com/gluestack/gluestack-ui.git'
      );
      console.log('gluestack-ui repository cloned successfully.');
    }
  } catch (err) {
    console.error(
      '\x1b[31m',
      `Error while cloning or pulling gluestack-ui repository: ${err}`,
      '\x1b[0m'
    );
  }
};

const initialProviderAdder = async (
  componentFolderPath: string
): Promise<void> => {
  try {
    // await getComponentGitRepo();
    createFolders(`${currDir}/${componentFolderPath}`);
    const sourcePath = `${homeDir}/.gluestack/cache/gluestack-ui/example/storybook/src/ui-components`;
    const targetPath = path.join(currDir, componentFolderPath);
    await addProvider(sourcePath, targetPath);
    await addIndexFile(targetPath);
  } catch (error) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `❌Failed to add gluestack-ui Provider: ${error}`
    );
  }
};

export { componentAdder, initialProviderAdder, getComponentGitRepo };
