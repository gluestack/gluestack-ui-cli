import * as fs from 'fs';
import * as path from 'path';
import { installPackages } from '.';
import { cancel, isCancel, log, select, text } from '@clack/prompts';
import { config } from '../config';

const _currDir = process.cwd();
let installDependencies: string[] = [];

// Function to parse imports from a TypeScript file
function parseImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = content.match(
    /import\s+(?:([\w{},\s]+)\s+from\s+)?(['"])([^'"]+)\2;/g
  );
  if (imports) {
    return imports
      .map((importStatement) => {
        const importPath = importStatement.match(/(['"])([^'"]+)\1/)![2];
        // Exclude imports from current directory (./) or parent directory (../)
        if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
          return importPath;
        }
      })
      .filter(Boolean) as string[]; // Filter out undefined values
  }
  return [];
}

// Function to generate config files for each component
async function generateConfig(rootDir: string, currentComponent: string) {
  const componentConfig = {
    installDependencies: [] as string[],
  };
  const componentIndexPath = path.join(rootDir, currentComponent, 'index.tsx');
  if (!fs.existsSync(componentIndexPath)) return;
  const componentImports = parseImports(componentIndexPath);
  componentImports.forEach((importedPackage) => {
    if (
      importedPackage.startsWith(config.gluestackUIPattern) &&
      !importedPackage.startsWith(config.nativewindUtilPattern)
    ) {
      const componentName = importedPackage.split('/')[1];
      if (
        currentComponent === config.providerComponent &&
        componentName !== undefined
      ) {
        installDependencies.push(importedPackage);
      }
      if (componentName !== undefined) {
        componentConfig.installDependencies.push(importedPackage);
      }
    } else {
      if (
        !installDependencies.includes(importedPackage) &&
        !importedPackage.startsWith(config.nativewindUtilPattern)
      ) {
        installDependencies.push(importedPackage);
      }
    }
  });
  if (currentComponent !== config.providerComponent)
    fs.writeFileSync(
      path.join(rootDir, currentComponent, 'config.json'),
      JSON.stringify(componentConfig, null, 2)
    );
}

// Function to fetch and install packages from config.json files
async function fetchAndInstallPackages(
  dir: string,
  installationMethod: string
) {
  let allPackages: string[] = [];

  // Read all directories in the components directory
  const componentDirectories = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Iterate over each component directory
  componentDirectories.forEach((componentName) => {
    const configPath = path.join(dir, componentName, 'config.json');

    try {
      if (!fs.existsSync(configPath)) {
        return;
      }
      let config;
      const fileContent = fs.readFileSync(configPath, 'utf8');
      if (fileContent.trim() !== '') {
        try {
          config = JSON.parse(fileContent);
        } catch (err) {
          // Handle the error, such as setting a default configuration or logging it
          return;
        }
      } else {
        return;
      }
      const { installDependencies } = config;

      // Add installDependencies to allPackages array
      allPackages.push(...installDependencies);
    } catch (error) {
      log.error(
        `Error reading config.json for ${componentName}: ${
          (error as Error).message
        }`
      );
    }
  });
  try {
    await installPackages(installationMethod, allPackages);
    if (config.style === config.nativeWindRootPath) {
    }
    await configCleanup(dir);
  } catch (err) {
    log.error(`\x1b[31mError : ${(err as Error).message}\x1b[0m`);
    await configCleanup(dir);
    process.exit(1);
  }
}

//function to remove config.json files from components
async function configCleanup(directoryPath: string) {
  try {
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    const directories = entries.filter((entry) => entry.isDirectory());
    // Iterate over each directory
    directories.forEach((directory) => {
      const componentPath = path.join(directoryPath, directory.name);
      const configPath = path.join(componentPath, 'config.json');
      if (fs.existsSync(configPath)) {
        fs.unlinkSync(configPath);
      }
    });
  } catch (error) {
    log.error(
      `\x1b[31mError :  Error occurred during config cleanup: ${
        (error as Error).message
      }\x1b[0m`
    );
  }
}

// Function to get dependencies from UIconfig file
async function getUIConfigDependencies(filePath: string) {
  const fileImports = parseImports(filePath);
  fileImports.forEach((fileImports) => {
    if (!installDependencies.includes(fileImports)) {
      installDependencies.push(fileImports);
    }
  });
}

// Function to prompt user to select a component style
async function promptComponentStyle() {
  const selectedStyle = await select({
    message: 'Which style-engine would you like to use in your project?',
    options: [
      { value: config.nativeWindRootPath, label: 'NativeWind' },
      { value: config.gluestackStyleRootPath, label: 'gluestack-style' },
    ],
  });
  if (isCancel(selectedStyle)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return selectedStyle;
}

// Function to get existing component style
async function getExistingComponentStyle() {
  if (fs.existsSync(path.join(_currDir, config.UIconfigPath))) {
    const fileContent: string = fs.readFileSync(
      path.join(_currDir, config.UIconfigPath),
      'utf8'
    );
    // Define a regular expression pattern to match import statements
    const importPattern: RegExp = new RegExp(
      `import {\\s*\\w+\\s*} from ['"]nativewind['"]`,
      'g'
    );
    if (importPattern.test(fileContent)) {
      config.style = config.nativeWindRootPath;
      return config.nativeWindRootPath;
    } else {
      config.style = config.gluestackStyleRootPath;
      return config.gluestackStyleRootPath;
    }
  }
}

async function getComponentStyle() {
  try {
    if (
      fs.existsSync(path.join(_currDir, config.writableComponentsPath)) &&
      fs.existsSync(path.join(_currDir, config.UIconfigPath))
    )
      getExistingComponentStyle();
    if (
      fs.existsSync(path.join(_currDir, config.writableComponentsPath)) &&
      !fs.existsSync(path.join(_currDir, config.UIconfigPath))
    ) {
      const userInput = await text({
        message: `No file found as ${config.configFileName} in components folder, Enter path to your config file in your project, if exist:`,
        validate(value) {
          if (value.length === 0) return `please enter a valid path`;
        },
      });
      config.UIconfigPath = userInput.toString();
      config.configFileName = config.UIconfigPath.split('/').pop() as string;
      if (fs.existsSync(path.join(_currDir, config.UIconfigPath)))
        getExistingComponentStyle();
      else {
        log.error(`\x1b[31mInvalid config path provided\x1b[0m`);
        process.exit(1);
      }
    }
    if (!fs.existsSync(path.join(_currDir, config.writableComponentsPath))) {
      log.warning(
        `\x1b[33mgluestack is not initialized in the project. use 'npx gluestack-ui init' or 'help' to continue.\x1b[0m`
      );
      process.exit(1);
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
}

// Main function to start generating config files
async function generateConfigAndInstallDependencies({
  componentsDir,
  installationMethod,
  optionalPackages,
}: {
  componentsDir: string;
  installationMethod: string;
  optionalPackages?: string[];
}) {
  if (optionalPackages) {
    installDependencies = optionalPackages;
  }
  const allComponents = await fs.readdirSync(componentsDir);
  allComponents.forEach((component) => {
    const componentPath = path.join(componentsDir, component);
    const stats = fs.statSync(componentPath);
    if (stats.isDirectory()) {
      generateConfig(componentsDir, component);
    }
  });
  await getUIConfigDependencies(path.join(_currDir, config.UIconfigPath));

  if (fs.existsSync(path.join(componentsDir, config.providerComponent))) {
    fs.writeFileSync(
      path.join(componentsDir, config.providerComponent, 'config.json'),
      JSON.stringify({ installDependencies }, null, 2)
    );
  }

  await fetchAndInstallPackages(componentsDir, installationMethod);
}

export {
  generateConfigAndInstallDependencies,
  getComponentStyle,
  promptComponentStyle,
};
