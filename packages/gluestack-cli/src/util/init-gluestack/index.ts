import {
  generateConfigAndInstallDependencies,
  promptComponentStyle,
} from '../create-config';
import { config } from '../../config';
import os from 'os';
import {
  checkIfFolderExists,
  detectProjectType,
  cloneRepositoryAtRoot,
  getAdditionalDependencies,
} from '..';
import fs from 'fs-extra';
import { join } from 'path';
import { log } from '@clack/prompts';
import { promisify } from 'util';

const _currDir = process.cwd();
const _homeDir = os.homedir();

interface TSConfig {
  compilerOptions?: {
    paths?: Record<string, string[]>;
    jsxImportSource?: string;
  };
}

const InitializeGlueStack = async ({
  installationMethod = '',
}: {
  installationMethod: string | undefined;
}) => {
  try {
    const initializeStatus = await checkIfFolderExists(
      join(_currDir, config.writableComponentsPath, config.providerComponent)
    );
    if (initializeStatus) {
      log.info(
        `\x1b[33mgluestack is already initialized in the project, use 'npx gluestack-ui help' command to continue\x1b[0m`
      );
      process.exit(1);
    }
    await cloneRepositoryAtRoot(join(_homeDir, config.gluestackDir));

    const projectType = await detectProjectType(_currDir);
    const componentStyle = await promptComponentStyle();
    if (typeof componentStyle === 'string') {
      config.style = componentStyle;
    }
    // add gluestack provider component
    await addProvider();
    // get additional dependencies based on the project type and component style
    const additionalDependencies = await getAdditionalDependencies(
      projectType,
      config.style
    );
    await generateConfigAndInstallDependencies({
      componentsDir: join(_currDir, config.writableComponentsPath),
      installationMethod: installationMethod,
      optionalPackages: additionalDependencies,
    });
    if (config.style === config.nativeWindRootPath) {
      await nativeWindInit(projectType);
    } else {
      //code for gluestack-style setup
    }
  } catch (err) {
    log.error(`\x1b[31mError occured in init. (${err as Error})\x1b[0m`);
  }
};

async function addProvider() {
  try {
    await fs.ensureDir(
      join(_currDir, config.writableComponentsPath, config.providerComponent)
    );
    await fs.copy(
      join(
        _homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style,
        config.providerComponent
      ),
      join(_currDir, config.writableComponentsPath, config.providerComponent)
    );
    // addIndexFile(join(_currDir, config.writableComponentsPath));
  } catch (err) {
    log.error(
      `\x1b[31mError occured while adding the provider. (${
        err as Error
      })\x1b[0m`
    );
  }
}

async function nativeWindInit(projectType: string) {
  try {
    if (projectType === config.nextJsProject) {
      await initNatiwindInNextJs();
    }
    if (projectType === config.expoProject) {
      await initNatiwindInExpo();
    }
    if (projectType === config.reactNativeCLIProject) {
      await initNatiwindInReactNativeCLI();
    }
    await commonInitialization(projectType);
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function updateTSConfigPaths(projectType: string): Promise<void> {
  try {
    const tsConfigPath = 'tsconfig.json'; // Path to your tsconfig.json file
    let tsConfig: TSConfig = {};
    if (fs.existsSync(join(_currDir, tsConfigPath))) {
      const rawData = await readFileAsync(join(_currDir, tsConfigPath), 'utf8');
      tsConfig = JSON.parse(rawData);
    } else {
      await fs.ensureFile(join(_currDir, tsConfigPath));
      tsConfig = {
        compilerOptions: {},
      };
    }
    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }
    // Add jsxImportSource for Next.js projects
    if (projectType === config.nextJsProject) {
      tsConfig.compilerOptions.jsxImportSource = 'nativewind';
    }

    if (!tsConfig.compilerOptions.paths) {
      // Case 1: Paths do not exist, add new paths
      tsConfig.compilerOptions.paths = {
        '@/*': ['./*'],
      };
    } else {
      // Case 2 & 3: Paths exist, update them without undoing previous values
      tsConfig.compilerOptions.paths['@/*'].push('./*');
    }

    await writeFileAsync(
      tsConfigPath,
      JSON.stringify(tsConfig, null, 2),
      'utf8'
    );
  } catch (err) {
    log.error(
      `\x1b[31mError occured while installing dependencies (${
        err as Error
      })\x1b[0m`
    );
  }
}
//refactor this
async function generateGlobalCSS(existingPath?: string): Promise<void> {
  try {
    if (existingPath) {
      const fileContent = fs.readFileSync(
        join(__dirname, config.templatesDir, 'common/global.css')
      );
      await fs.appendFile(
        join(existingPath),
        fileContent.toString(), // Convert buffer to string
        'utf8'
      );
    } else {
      await fs.ensureFile(join(_currDir, 'global.css'));
      await fs.copy(
        join(__dirname, config.templatesDir, 'common/global.css'),
        join(_currDir, 'global.css'),
        {
          overwrite: true,
        }
      );
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}
//refactor this
async function updateGlobalCSS(projectRoot: string) {
  let fileExist = false;
  fs.readdir(projectRoot, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    files.forEach((file) => {
      if (file === 'node_modules' || file.startsWith('.')) {
        return;
      }
      const filePath = join(projectRoot, file);
      fs.stat(filePath, async (err, stats) => {
        if (err) {
          console.error('Error getting file stats:', err);
          return;
        }
        if (stats.isDirectory()) {
          updateGlobalCSS(filePath);
        } else if (file === 'global.css' || file === 'globals.css') {
          await generateGlobalCSS(filePath);
          fileExist = true;
          return fileExist;
        }
      });
    });
    return fileExist;
  });
}

async function commonInitialization(projectType: string) {
  try {
    // await updateGlobalCSS(_currDir);
    // copy tailwind.config.js to the root of the project
    await fs.ensureFile(
      join(_homeDir, config.gluestackDir, config.tailwindConfigRootPath)
    );
    await fs.copy(
      join(_homeDir, config.gluestackDir, config.tailwindConfigRootPath),
      join(_currDir, 'tailwind.config.js')
    );
    await updateTSConfigPaths(projectType);
    // add or update global.css (check throughout the project for global.css and update it or create it)
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInNextJs() {
  try {
    const resourcePath = join(
      __dirname,
      config.templatesDir,
      config.nextJsProject
    );
    const filesAndFolders = fs.readdirSync(resourcePath);
    // add next.config.js, postcss.config.js and nativewind-env.d.ts
    for (const file of filesAndFolders) {
      await fs.copy(join(resourcePath, file), join(_currDir, file), {
        overwrite: true,
      });
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInExpo() {
  try {
    const resourcePath = join(
      __dirname,
      config.templatesDir,
      config.expoProject
    );
    const filesAndFolders = fs.readdirSync(resourcePath);
    // add babel.config.js, metro.config.js (SDK 50) and nativewind-env.d.ts
    for (const file of filesAndFolders) {
      await fs.copy(join(resourcePath, file), join(_currDir, file), {
        overwrite: true,
      });
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
  // add nativewind-env.d.ts
}

async function initNatiwindInReactNativeCLI() {
  // update babel.config.js by adding 'nativewind/babel' to the presets array
  // run npx pod install
  // add metro.config.js
  // add nativewind-env.d.ts
}

export { InitializeGlueStack };
