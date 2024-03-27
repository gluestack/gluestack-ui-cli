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
import path from 'path';
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
    await cloneRepositoryAtRoot();

    const initializeStatus = await checkIfFolderExists(
      path.join(
        _currDir,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
    if (initializeStatus) {
      log.info(
        `\x1b[33mGluestack is already initialized in the project, use 'npx gluestack-ui help' command to continue\x1b[0m`
      );
      process.exit(1);
    }
    const componentStyle = await promptComponentStyle();
    if (typeof componentStyle === 'string') {
      config.style = componentStyle;
    }
    const projectType = await detectProjectType(_currDir);
    // add provider component
    await addProvider();
    // get additional dependencies based on the project type and component style
    const additionalDependencies = await getAdditionalDependencies(
      projectType,
      config.style
    );
    await generateConfigAndInstallDependencies({
      componentsDir: path.join(_currDir, config.writableComponentsPath),
      installationMethod: installationMethod,
      optionalPackages: additionalDependencies,
    });
    if (config.style === config.nativeWindRootPath) {
      //code for nativewind setup
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
      path.join(
        _currDir,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
    await fs.copy(
      path.join(
        _homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style,
        config.providerComponent
      ),
      path.join(
        _currDir,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
    // addIndexFile(path.join(_currDir, config.writableComponentsPath));
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
    await fs.ensureFile(
      path.join(_homeDir, config.gluestackDir, config.tailwindConfigRootPath)
    );
    await fs.copy(
      path.join(_homeDir, config.gluestackDir, config.tailwindConfigRootPath),
      path.join(_currDir, 'tailwind.config.js')
    );
    await updateTSConfigPaths(projectType);
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
    if (fs.existsSync(path.join(_currDir, tsConfigPath))) {
      const rawData = await readFileAsync(
        path.join(_currDir, tsConfigPath),
        'utf8'
      );
      tsConfig = JSON.parse(rawData);
    } else {
      await fs.ensureFile(path.join(_currDir, tsConfigPath));
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
      tsConfig.compilerOptions.paths['@/*'] = ['./*'];
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

async function initNatiwindInNextJs() {
  try {
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInExpo() {}

async function initNatiwindInReactNativeCLI() {}

export { InitializeGlueStack };
