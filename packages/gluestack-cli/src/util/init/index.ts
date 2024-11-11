import os from 'os';
import { config } from '../../config';
import { promisify } from 'util';
import { execSync } from 'child_process';
import path, { join } from 'path';
import { log, confirm, spinner } from '@clack/prompts';
import fs, { copy, existsSync } from 'fs-extra';
import { RawConfig } from '../config/config-types';
import {
  checkIfInitialized,
  generateMonoRepoConfig,
  getEntryPathAndComponentsPath,
} from '../config';
import { cloneRepositoryAtRoot, installDependencies } from '..';
import { getProjectBasedDependencies } from '../../dependencies';
import { generateConfigNextApp } from '../config/next-config-helper';
import { generateConfigExpoApp } from '../config/expo-config-helper';
import { generateConfigRNApp } from '../config/react-native-config-helper';

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
  projectType = 'library',
  isTemplate = false,
}: {
  projectType: string;
  isTemplate?: boolean;
}) => {
  try {
    const initializeStatus = await checkIfInitialized(_currDir);
    if (initializeStatus) {
      log.info(
        `\x1b[33mgluestack-ui is already initialized in the project, use 'npx gluestack-ui help' command to continue\x1b[0m`
      );
      process.exit(1);
    }
    const confirmOverride = isTemplate
      ? true
      : await overrideWarning(filesToOverride(projectType));

    console.log(`\n\x1b[1mInitializing gluestack-ui v2...\x1b[0m\n`);
    await cloneRepositoryAtRoot(join(_homeDir, config.gluestackDir));
    const inputComponent = [config.providerComponent];
    const additionalDependencies = await getProjectBasedDependencies(
      projectType,
      config.style
    );
    await installDependencies(inputComponent, additionalDependencies);
    const s = spinner();
    s.start(
      '⏳ Generating project configuration. This might take a couple of minutes...'
    );
    await generateProjectConfigAndInit(projectType, confirmOverride);
    await addProvider();
    s.stop(`\x1b[32mProject configuration generated.\x1b[0m`);
    log.step(
      'Please refer the above link for more details --> \x1b[33mhttps://gluestack.io/ui/docs/home/overview/introduction \x1b[0m'
    );
    log.success(
      `\x1b[32mDone!\x1b[0m Initialized \x1b[1mgluestack-ui v2\x1b[0m in the project`
    );
  } catch (err) {
    log.error(`\x1b[31mError occured in init. (${err as Error})\x1b[0m`);
    process.exit(1);
  }
};

async function addProvider() {
  try {
    const targetPath = join(
      _currDir,
      config.writableComponentsPath,
      config.providerComponent
    );
    const sourcePath = join(
      _homeDir,
      config.gluestackDir,
      config.componentsResourcePath,
      config.style,
      config.providerComponent
    );

    await fs.ensureDir(targetPath);
    await fs.copy(sourcePath, targetPath);
  } catch (err) {
    log.error(`\x1b[31mError occured while adding the provider.\x1b[0m`);
    throw new Error((err as Error).message);
  }
}

//update tailwind.config.js and codemod
async function updateTailwindConfig(
  resolvedConfig: RawConfig,
  projectType: string
) {
  // Create a temporary file to store options
  const tempFilePath = join(os.tmpdir(), 'jscodeshift-options.json');
  try {
    const tailwindConfigRootPath = join(
      _homeDir,
      config.gluestackDir,
      config.tailwindConfigRootPath
    );
    const tailwindConfigPath = resolvedConfig.tailwind.config;
    await fs.copy(tailwindConfigRootPath, tailwindConfigPath);
    // Codemod to update tailwind.config.js usage
    const { entryPath } = getEntryPathAndComponentsPath(); // entryPaths is an array of strings

    fs.writeFileSync(
      tempFilePath,
      JSON.stringify({ paths: entryPath }) // Write paths and projectType to the file
    );
    const transformerPath = join(
      __dirname,
      `${config.codeModesDir}/tailwind-config-transform.ts`
    );

    // Build the jscodeshift command
    const command = `npx jscodeshift -t ${transformerPath} ${tailwindConfigPath} --optionsFile=${tempFilePath} --projectType=${projectType}`;

    // Execute the command
    execSync(command);
    // Delete the temporary file after usage
    fs.unlinkSync(tempFilePath);
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
    // Ensure the temporary file is deleted even in case of an error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
  }
}

//updateConfig helper, create default tsconfig.json
function createDefaultTSConfig() {
  return {
    compilerOptions: {
      paths: {
        '@/*': ['./*'],
      },
    },
    exclude: ['node_modules'],
  };
}
// updateConfig helper, read tsconfig.json
async function readTSConfig(configPath: string): Promise<TSConfig> {
  try {
    return JSON.parse(await readFileAsync(configPath, 'utf8'));
  } catch {
    return createDefaultTSConfig();
  }
}
// updateConfig helper, update paths in tsconfig.json
function updatePaths(
  paths: Record<string, string[]>,
  key: string,
  newValues: string[]
): void {
  paths[key] = Array.from(new Set([...(paths[key] || []), ...newValues]));
}
//update tsconfig.json
async function updateTSConfig(
  projectType: string,
  resolvedConfig: any
): Promise<void> {
  try {
    const configPath = resolvedConfig.config.tsConfig;
    let tsConfig: TSConfig = await readTSConfig(configPath);
    let tailwindConfig = resolvedConfig.tailwind.config;
    const tailwindConfigFileName = path.basename(tailwindConfig);

    tsConfig.compilerOptions = tsConfig.compilerOptions || {};
    tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {};

    // Next.js project specific configuration
    if (projectType === config.nextJsProject) {
      tsConfig.compilerOptions.jsxImportSource = 'nativewind';
    }
    updatePaths(tsConfig.compilerOptions.paths, '@/*', ['./*']);
    updatePaths(tsConfig.compilerOptions.paths, 'tailwind.config', [
      `./${tailwindConfigFileName}`,
    ]);

    await writeFileAsync(configPath, JSON.stringify(tsConfig, null, 2), 'utf8');
  } catch (err) {
    log.error(
      `\x1b[31mError occurred while updating tsconfig.json: ${(err as Error).message}\x1b[0m`
    );
  }
}

//update global.css
async function updateGlobalCss(resolvedConfig: RawConfig): Promise<void> {
  try {
    const globalCSSPath = resolvedConfig.tailwind.css;
    const globalCSSContent = await fs.readFile(
      join(__dirname, config.templatesDir, 'common', 'global.css'),
      'utf8'
    );
    const existingContent = await fs.readFile(globalCSSPath, 'utf8');
    if (existingContent.includes(globalCSSContent)) {
      return;
    } else {
      await fs.appendFile(
        globalCSSPath,
        globalCSSContent.toString(), // Convert buffer to string
        'utf8'
      );
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function commonInitialization(
  projectType: string,
  resolvedConfig: any,
  permission: boolean | symbol
) {
  try {
    //get resolvedFileNames from the resolvedConfig
    const resolvedConfigValues = Object.values(resolvedConfig).flat(Infinity);
    const flattenedConfigValues = resolvedConfigValues.flatMap((value) =>
      typeof value === 'string' ? value : Object.values(value as object)
    );
    const resolvedConfigFileNames = flattenedConfigValues.map(
      (filePath: any) =>
        typeof filePath === 'string' && path.parse(filePath).base
    );

    const resourcePath = join(__dirname, config.templatesDir, projectType);
    //if any filepath
    if (existsSync(resourcePath)) {
      const filesAndFolders = fs.readdirSync(resourcePath);
      //if any fileName in resourcePath matches with the resolvedConfigFileNames, copy the file
      await Promise.all(
        filesAndFolders.map(async (file) => {
          if (resolvedConfigFileNames.includes(path.parse(file).base)) {
            await copy(join(resourcePath, file), join(_currDir, file), {
              overwrite: true,
            });
          }
        })
      );
    }

    //add nativewind-env.d.ts contents
    await fs.copy(
      join(__dirname, config.templatesDir, 'common', 'nativewind-env.d.ts'),
      join(_currDir, 'nativewind-env.d.ts')
    );
    permission && (await updateTSConfig(projectType, resolvedConfig));
    permission && (await updateGlobalCss(resolvedConfig));
    await updateTailwindConfig(resolvedConfig, projectType);

    //function to update package.json script to implement darkMode in expo, will be removed later
    if (projectType === config.expoProject) {
      const packageJsonPath = join(_currDir, 'package.json');
      const packageJson = JSON.parse(
        await fs.readFile(packageJsonPath, 'utf8')
      );
      const devices = ['android', 'ios', 'web'];

      //get existing value of scripts
      devices.forEach((device) => {
        const script = packageJson.scripts[device];
        packageJson.scripts[device] = `DARK_MODE=media `.concat(script);
      });

      await fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
        'utf8'
      );
    }
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

//generate project config and initialize
async function generateProjectConfigAndInit(
  projectType: string,
  confirmOverride: boolean | symbol
) {
  let permission;
  if (confirmOverride === false || typeof confirmOverride === 'symbol') {
    permission = false;
  } else permission = true;
  let resolvedConfig; // Initialize with a default value
  if (projectType !== 'library') {
    switch (projectType) {
      case config.nextJsProject:
        await generateConfigNextApp(permission);
        break;
      case config.expoProject:
        await generateConfigExpoApp(permission);
        break;
      case config.reactNativeCLIProject:
        await generateConfigRNApp(permission);
        break;
      default:
        break;
    }
  } else {
    //write function to generate config for monorepo or library
    await generateMonoRepoConfig();
  }
  return resolvedConfig;
}

//files to override in the project directory data
const filesToOverride = (projectType: string) => {
  switch (projectType) {
    case config.nextJsProject:
      return [
        'next.config.*',
        'tailwind.config.*',
        'global.css',
        'tsconfig.json',
      ];
    case config.expoProject:
      return [
        'babel.config.js',
        'metro.config.js',
        'tailwind.config.*',
        'global.css',
        'tsconfig.json',
      ];
    case config.reactNativeCLIProject:
      return [
        'babel.config.js',
        'metro.config.js',
        'global.css',
        'tsconfig.json',
      ];
    default:
      return [];
  }
};

// Helper function to calculate the length of the string without ANSI escape codes
function getStringLengthWithoutAnsi(string: string) {
  return string.replace(/\x1b\[[0-9;]*m/g, '').length;
}
//overriding warning message
async function overrideWarning(files: string[]) {
  if (files.length === 0) {
    return true;
  }
  const boxLength = 90;
  console.log(`\x1b[33m
  ┌${'─'.repeat(boxLength)}┐
  │                                                                                          │
  │  NOTE: Files to get modified                                                             │
  │                                                                                          │
  │  The command you've run is attempting to modify certain files in your project,           │
  │  if already exist. Here's what's happening:                                              │
  │                                                                                          │
${files
  .map(
    (file) =>
      `  │  - ${file}${' '.repeat(
        boxLength - getStringLengthWithoutAnsi(`  │  - ${file}`) + 3
      )}│`
  )
  .join('\n')}
  │                                                                                          │
  └${'─'.repeat(boxLength)}┘
  \x1b[0m`);

  const confirmInput = await confirm({
    message: `\x1b[33mProceed with caution. Make sure to commit your changes before proceeding. Continue?
    \x1b[0m`,
  });
  if (confirmInput === false) {
    log.info(
      'Skipping making changes in files. Please refer docs for making the changes manually --> \x1b[33mhttps://gluestack.io/ui/docs/home/getting-started/installation\x1b[0m'
    );
  }
  return confirmInput;
}

export { InitializeGlueStack, commonInitialization };
