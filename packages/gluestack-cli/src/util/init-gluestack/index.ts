import {
  generateConfigAndInstallDependencies,
  promptComponentStyle,
} from '../create-config';
import { config } from '../../config';
import os from 'os';
import { addIndexFile, checkIfFolderExists, cloneRepositoryAtRoot } from '..';
import fs from 'fs-extra';
import path from 'path';
import { log } from '@clack/prompts';
import { promisify } from 'util';

const currDir = process.cwd();
const homeDir = os.homedir();

interface TSConfig {
  compilerOptions?: {
    paths?: Record<string, string[]>;
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
        currDir,
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
    await addProvider();

    if (config.style === config.nativeWindRootPath) {
      await generateConfigAndInstallDependencies({
        rootDir: path.join(currDir, config.writableComponentsPath),
        installationMethod: installationMethod,
        optionalPackages: config.nativeWindDependencies,
      });
      await nativeWindInit();
    } else {
      await generateConfigAndInstallDependencies({
        rootDir: path.join(currDir, config.writableComponentsPath),
        installationMethod: installationMethod,
      });
    }
  } catch (err) {
    log.error(`\x1b[31mError: gitignore file not found in template!\x1b[0m`);
  }
};

async function addProvider() {
  try {
    await fs.ensureDir(
      path.join(
        currDir,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
    await fs.copy(
      path.join(
        homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style,
        config.providerComponent
      ),
      path.join(
        currDir,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
    addIndexFile(path.join(currDir, config.writableComponentsPath));
  } catch (err) {
    log.error(`\x1b[31mError: gitignore file not found in template!\x1b[0m`);
  }
}

async function nativeWindInit() {
  try {
    await fs.ensureFile(
      path.join(homeDir, config.gluestackDir, config.tailwindConfigRootPath)
    );
    await fs.copy(
      path.join(homeDir, config.gluestackDir, config.tailwindConfigRootPath),
      path.join(currDir, 'tailwind.config.js')
    );
    await updateTSConfigPaths();
  } catch (err) {
    log.error(`\x1b[31mError: gitignore file not found in template!\x1b[0m`);
  }
}

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

async function updateTSConfigPaths(): Promise<void> {
  try {
    const tsConfigPath = 'tsconfig.json'; // Path to your tsconfig.json file
    let tsConfig: TSConfig = {};
    if (fs.existsSync(path.join(currDir, tsConfigPath))) {
      const rawData = await readFileAsync(
        path.join(currDir, tsConfigPath),
        'utf8'
      );
      tsConfig = JSON.parse(rawData);
    } else {
      await fs.ensureFile(path.join(currDir, tsConfigPath));
      tsConfig = {
        compilerOptions: {},
      };
    }

    if (!tsConfig.compilerOptions) {
      tsConfig.compilerOptions = {};
    }

    if (!tsConfig.compilerOptions.paths) {
      // Case 1: Paths do not exist, add new paths
      tsConfig.compilerOptions.paths = {
        '@/*': ['./src/*'],
      };
    } else {
      // Case 2 & 3: Paths exist, update them without undoing previous values
      tsConfig.compilerOptions.paths['@/*'] = ['./src/*'];
    }

    await writeFileAsync(
      tsConfigPath,
      JSON.stringify(tsConfig, null, 2),
      'utf8'
    );
  } catch (err) {
    log.error(`\x1b[31mError: gitignore file not found in template!\x1b[0m`);
  }
}

export { InitializeGlueStack };
