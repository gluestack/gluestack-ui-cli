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
import { cancel, isCancel, log, confirm } from '@clack/prompts';
import { promisify } from 'util';
import { execSync } from 'child_process';

const _currDir = process.cwd();
const _homeDir = os.homedir();

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

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
      log.success(`\x1b[32mInstallation completed\x1b[0m`);
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
    await commonInitialization(projectType);
    if (projectType === config.nextJsProject) {
      await initNatiwindInNextJs();
    }
    if (projectType === config.expoProject) {
      await initNatiwindInExpo();
    }
    if (projectType === config.reactNativeCLIProject) {
      await initNatiwindInReactNativeCLI();
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

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
      const paths = tsConfig.compilerOptions.paths['@/*'];
      if (!paths.includes('./*')) {
        // If './*' is not included, add it
        paths.push('./*');
      }
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

async function generateGlobalCSS(): Promise<void> {
  try {
    if (fs.existsSync(join(_currDir, 'global.css'))) {
      const globalCSSContent = await fs.readFile(
        join(__dirname, config.templatesDir, 'common/global.css'),
        'utf8'
      );
      await fs.appendFile(
        join(_currDir, 'global.css'),
        globalCSSContent.toString(), // Convert buffer to string
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

async function commonInitialization(projectType: string) {
  try {
    const resourcePath = join(__dirname, config.templatesDir, projectType);
    const filesAndFolders = fs.readdirSync(resourcePath);
    const confirmation = await overrideWarning(filesAndFolders);
    if (confirmation === true) {
      for (const file of filesAndFolders) {
        await fs.copy(join(resourcePath, file), join(_currDir, file), {
          overwrite: true,
        });
      }
    } else {
      log.message(
        'Skipping override. Please refer docs for making changes manually...'
      );
    }
    await fs.ensureFile(
      join(_homeDir, config.gluestackDir, config.tailwindConfigRootPath)
    );
    await fs.copy(
      join(_homeDir, config.gluestackDir, config.tailwindConfigRootPath),
      join(_currDir, 'tailwind.config.js')
    );
    await updateTSConfigPaths(projectType);
    // add or update global.css (check throughout the project for global.css and update it or create it)
    await generateGlobalCSS();
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInNextJs() {
  try {
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInExpo() {
  try {
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInReactNativeCLI() {
  try {
    execSync('npx pod-install', { stdio: 'inherit' });
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function overrideWarning(files: string[]) {
  const confirmInput = await confirm({
    message: `\x1b[33mWARNING: Overriding Files

    The command you've run is attempting to override certain files in your project, if already exist. Here's what's happening:
    
   ${files.map((file) => `File - [${file}]`).join('\n')}
    
    Proceed with caution. Make sure to backup any important files before proceeding.
    \x1b[0m`,
  });
  if (isCancel(confirmInput)) {
    cancel('Skipping override. Please refer docs for manual installation.');
  }
  return confirmInput;
}

// function renameFileWithOldExtension(filePath: string): void {
//   const fileExtension = extname(filePath);
//   const fileNameWithoutExtension = basename(filePath, fileExtension);
//   const directoryPath = dirname(filePath);
//   const newFileName = `${fileNameWithoutExtension}_old${fileExtension}`;
//   const newFilePath = join(directoryPath, newFileName);
//   fs.rename(filePath, newFilePath, (err) => {
//     if (err) {
//       console.error('Error renaming file:', err);
//     } else {
//       console.log('File renamed successfully.');
//     }
//   });
// }

export { InitializeGlueStack };
