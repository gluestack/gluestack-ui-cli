import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  generateSpecificFile,
  installPackages,
  replaceRelativeImportInFile,
} from '.';
import { log } from '@clack/prompts';
import { config } from '../config';

const currDir = process.cwd();
const homeDir = os.homedir();
let installDependencies: string[] = [];
const congifPath = path.join(
  process.cwd(),
  'components',
  'gluestack-ui.config.ts'
);

async function configCleanup(directoryPath: string) {
  try {
    // Read all files in the directory
    const entries = fs.readdirSync(directoryPath, { withFileTypes: true });
    // Filter out directories from the list of entries
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

async function fetchAndInstallPackages(installationMethod = 'npm') {
  const componentsDir = path.join(currDir, 'components');
  let allPackages: string[] = [];

  // Read all directories in the components directory
  const componentDirectories = fs
    .readdirSync(componentsDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  // Iterate over each component directory
  componentDirectories.forEach((componentName) => {
    const configPath = path.join(componentsDir, componentName, 'config.json');

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
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

  await installPackages(installationMethod, allPackages);
  await configCleanup(path.join(currDir, 'components'));
}

// Function to parse imports from a TypeScript file
function parseImports(filePath: string): string[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = content.match(/import\s+{[^}]+}\s+from\s+["']([^"']+)["']/g);
  if (imports) {
    return imports
      .map((importStatement) => {
        const importPath = importStatement.match(/from\s+["']([^"']+)["']/)![1];
        // Exclude imports from current directory (./) or parent directory (../)
        if (!importPath.startsWith('./') && !importPath.startsWith('../')) {
          return importPath;
        }
      })
      .filter(Boolean) as string[]; // Filter out undefined values
  }
  return [];
}

async function generateConfig(rootDir: string, currentComponent: string) {
  const componentConfig = {
    installDependencies: [] as string[],
  };

  const componentImports = parseImports(
    path.join(rootDir, currentComponent, 'index.tsx')
  );

  componentImports.forEach((importedPackage) => {
    if (importedPackage.startsWith('@gluestack-ui/')) {
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
      if (!installDependencies.includes(importedPackage)) {
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

async function getConfigDependencies(filePath: string) {
  const fileImports = parseImports(filePath);
  fileImports.forEach((fileImports) => {
    if (!installDependencies.includes(fileImports)) {
      installDependencies.push(fileImports);
    }
  });
}

// Main function to start generating config files
async function generateConfigAndInstallDependencies(
  rootDir: string,
  installationMethod: string
) {
  const allComponents = await fs.readdirSync(
    path.join(currDir, config.writableComponentsPath)
  );
  allComponents.forEach((component) => {
    const componentPath = path.join(
      currDir,
      config.writableComponentsPath,
      component
    );
    const stats = fs.statSync(componentPath);
    if (stats.isDirectory()) {
      generateConfig(rootDir, component);
    }
  });
  await generateSpecificFile(
    path.join(homeDir, config.configResourcepath),
    congifPath,
    'gluestack-ui.config.ts'
  );

  await getConfigDependencies(
    path.join(currDir, 'components', 'gluestack-ui.config.ts')
  );

  if (fs.existsSync(path.join(rootDir, config.providerComponent))) {
    fs.writeFileSync(
      path.join(rootDir, config.providerComponent, 'config.json'),
      JSON.stringify({ installDependencies }, null, 2)
    );
  }
  const oldImportPath: string = './config';
  const newImportPath: string = '../gluestack-ui.config';
  await replaceRelativeImportInFile(
    path.join(currDir, 'components', config.providerComponent, 'index.tsx'),
    oldImportPath,
    newImportPath
  );
  await fetchAndInstallPackages(installationMethod);
}

export { generateConfigAndInstallDependencies };
