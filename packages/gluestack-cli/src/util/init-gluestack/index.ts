import os from 'os';
import { config } from '../../config';
import fs, { copy, ensureFile, existsSync } from 'fs-extra';
import path, { join, relative } from 'path';
import { log, confirm } from '@clack/prompts';
import { promisify } from 'util';
import { exec, execSync } from 'child_process';
import { generateConfigNextApp } from '../config-generate/next-config-helper';
import { generateConfigExpoApp } from '../config-generate/expo-config-helper';
import { generateConfigRNApp } from '../config-generate/react-native-config-helper';
import {
  RawConfig,
  NextResolvedConfig,
  ExpoResolvedConfig,
} from '../config-generate/config-types';
import {
  checkIfInitialized,
  generateGluestackConfig,
  getEntryPathAndComponentsPath,
} from '../config-generate';
import {
  cloneRepositoryAtRoot,
  getAdditionalDependencies,
  addDependencies,
  projectRootPath,
} from '..';

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
  projectType = 'library',
}: {
  installationMethod: string | undefined;
  projectType: string;
}) => {
  try {
    const initializeStatus = await checkIfInitialized(projectRootPath);
    if (initializeStatus) {
      log.info(
        `\x1b[33mgluestack-ui is already initialized in the project, use 'npx gluestack-ui help' command to continue\x1b[0m`
      );
      process.exit(1);
    }
    console.log(`\n\x1b[1mInitializing gluestack-ui v2...\x1b[0m\n`);
    await cloneRepositoryAtRoot(join(_homeDir, config.gluestackDir));
    const inputComponent = [config.providerComponent];
    const additionalDependencies = await getAdditionalDependencies(
      projectType,
      config.style
    );
    await generateProjectConfigAndInit(projectType);
    await addProvider();
    await addDependencies(
      installationMethod,
      inputComponent,
      additionalDependencies
    );
    log.step(
      'Please refer the above link for more details --> \x1b[33mhttps://gluestack.io/ui/nativewind/docs/overview/introduction \x1b[0m'
    );
    log.success(
      `\x1b[32mDone!\x1b[0m Initialized \x1b[1mgluestack-ui v2\x1b[0m in the project`
    );
  } catch (err) {
    log.error(`\x1b[31mError occured in init. (${err as Error})\x1b[0m`);
  }
};

async function addProvider() {
  try {
    await fs.ensureDir(
      join(
        projectRootPath,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
    await fs.copy(
      join(
        _homeDir,
        config.gluestackDir,
        config.componentsResourcePath,
        config.style,
        config.providerComponent
      ),
      join(
        projectRootPath,
        config.writableComponentsPath,
        config.providerComponent
      )
    );
  } catch (err) {
    log.error(
      `\x1b[31mError occured while adding the provider. (${
        err as Error
      })\x1b[0m`
    );
  }
}

async function updateTailwindConfig(resolvedConfig: RawConfig) {
  try {
    const tailwindConfigRootPath = join(
      _homeDir,
      config.gluestackDir,
      config.tailwindConfigRootPath
    );
    const tailwindConfigPath = resolvedConfig.tailwind.config;
    await fs.copy(tailwindConfigRootPath, tailwindConfigPath);
    // Codemod to update tailwind.config.js usage
    const { entryPath } = getEntryPathAndComponentsPath();
    const allNewPaths = JSON.stringify(entryPath);
    const transformerPath = join(
      __dirname,
      `${config.codeModesDir}/tailwind-config-transform.ts`
    );
    exec(
      `npx jscodeshift -t ${transformerPath}  ${tailwindConfigPath} --paths='${allNewPaths}'`
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function updateTSConfig(projectType: string): Promise<void> {
  try {
    const tsConfigPath = join(projectRootPath, 'tsconfig.json');
    let tsConfig: TSConfig = {};
    try {
      tsConfig = JSON.parse(await readFileAsync(tsConfigPath, 'utf8'));
    } catch {
      await fs.ensureFile(tsConfigPath);
    }
    tsConfig.compilerOptions = tsConfig.compilerOptions || {};

    // Next.js project specific configuration
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

async function updateGlobalCss(resolvedConfig: RawConfig): Promise<void> {
  try {
    const globalCSSPath = resolvedConfig.tailwind.css;
    await fs.ensureFile(globalCSSPath);

    const globalCSSContent = await fs.readFile(
      join(__dirname, config.templatesDir, 'common/global.css'),
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

async function commonInitialization(projectType: string, resolvedConfig: any) {
  try {
    const resolvedConfigValues = Object.values(resolvedConfig).flat(Infinity);
    const flattenedConfigValues = resolvedConfigValues.flatMap((value) =>
      typeof value === 'string' ? value : Object.values(value as object)
    );
    const resolvedConfigFileNames = flattenedConfigValues.map(
      (filePath: string) => path.parse(filePath).base
    );
    const resourcePath = join(__dirname, config.templatesDir, projectType);
    if (existsSync(resourcePath)) {
      const filesAndFolders = fs.readdirSync(resourcePath);
      await Promise.all(
        filesAndFolders.map(async (file) => {
          if (resolvedConfigFileNames.includes(path.parse(file).base)) {
            await copy(join(resourcePath, file), join(projectRootPath, file), {
              overwrite: true,
            });
          }
        })
      );
    }

    //add nativewind-env.d.ts
    await fs.ensureFile(join(projectRootPath, 'nativewind-env.d.ts'));
    await fs.copy(
      join(__dirname, `${config.templatesDir}/common/nativewind-env.d.ts`),
      join(projectRootPath, 'nativewind-env.d.ts')
    );

    //add or update all the above files
    await updateTailwindConfig(resolvedConfig);
    await updateTSConfig(projectType);
    await updateGlobalCss(resolvedConfig);
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

//refactor
async function initNatiwindNextApp(resolvedConfig: NextResolvedConfig) {
  try {
    const NextTranformer = join(
      __dirname,
      `${config.codeModesDir}/${config.nextJsProject}`
    );
    let nextTransformerPath = '';
    let fileType = '';
    const nextConfigPath = resolvedConfig.config.nextConfig;

    if (nextConfigPath?.endsWith('.mjs')) {
      fileType = 'mjs';
    } else if (nextConfigPath?.endsWith('.js')) {
      fileType = 'js';
    }
    nextTransformerPath = join(
      `${NextTranformer}/next-config-${fileType}-transform.ts`
    );

    if (nextTransformerPath && nextConfigPath) {
      exec(`npx jscodeshift -t ${nextTransformerPath}  ${nextConfigPath}`);
    }
    if (resolvedConfig.app?.entry?.includes('layout')) {
      // if app router add registry file to root
      const registryContent = await fs.readFile(
        join(__dirname, `${config.templatesDir}/common/registry.tsx`),
        'utf8'
      );

      if (resolvedConfig.app.registry) {
        await fs.ensureFile(resolvedConfig.app.registry);
        await fs.writeFile(
          resolvedConfig.app.registry,
          registryContent,
          'utf8'
        );
      }
    }
    if (resolvedConfig.app?.entry?.includes('_app')) {
      const pageDirPath = path.dirname(resolvedConfig.app.entry);
      const docsPagePath = join(pageDirPath, '_document.tsx');
      const transformerPath = join(
        `${NextTranformer}/next-document-update-transform.ts`
      );
      exec(`npx jscodeshift -t ${transformerPath} ${docsPagePath}`);
    }

    const options = JSON.stringify(resolvedConfig);
    const transformerPath = join(
      `${NextTranformer}/next-add-provider-transform.ts --config='${options}'`
    );
    exec(
      `npx jscodeshift -t ${transformerPath}  ${resolvedConfig.app.entry} --componentsPath='${config.writableComponentsPath}'`
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindExpoApp(resolveConfig: ExpoResolvedConfig) {
  try {
    await ensureFile(resolveConfig.config.babelConfig);
    await ensureFile(resolveConfig.config.metroConfig);

    const expoTransformer = join(
      __dirname,
      config.codeModesDir,
      config.expoProject
    );
    const BabeltransformerPath = join(
      expoTransformer,
      'babel-config-transform.ts'
    );
    const metroTransformerPath = join(
      expoTransformer,
      'metro-config-transform.ts'
    );
    const rawCssPath = relative(_currDir, resolveConfig.tailwind.css);
    const cssPath = './'.concat(rawCssPath);
    const cssImportPath = '@/'.concat(rawCssPath);

    const addProviderTransformerPath = join(
      expoTransformer,
      'expo-add-provider-transform.ts'
    );
    exec(
      `npx jscodeshift -t ${metroTransformerPath}  ${
        resolveConfig.config.metroConfig
      } --cssPath='${cssPath}' --config='${JSON.stringify(resolveConfig)}'`
    );
    exec(
      `npx jscodeshift -t ${BabeltransformerPath}  ${resolveConfig.config.babelConfig}`
    );
    exec(
      `npx jscodeshift -t ${addProviderTransformerPath}  ${resolveConfig.app.entry} --cssImportPath='${cssImportPath}' --componentsPath='${config.writableComponentsPath}'`
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindRNApp(resolvedConfig: any) {
  try {
    await ensureFile(resolvedConfig.config.babelConfig);
    await ensureFile(resolvedConfig.config.metroConfig);

    const RNTransformer = join(
      __dirname,
      config.codeModesDir,
      config.reactNativeCLIProject
    );
    const BabelTransformerPath = join(
      RNTransformer,
      `babel-config-transform.ts`
    );
    const metroTransformerPath = join(
      RNTransformer,
      `metro-config-transform.ts`
    );
    const addProviderTransformerPath = join(
      RNTransformer,
      'rn-add-provider-transform.ts'
    );

    exec(
      `npx jscodeshift -t ${BabelTransformerPath}  ${resolvedConfig.config.babelConfig}`
    );
    exec(
      `npx jscodeshift -t ${metroTransformerPath}  ${resolvedConfig.config.metroConfig}`
    );
    exec(
      `npx  jscodeshift -t ${addProviderTransformerPath} ${resolvedConfig.app.entry}  --componentsPath='${config.writableComponentsPath}'`
    );
    execSync('npx pod-install', { stdio: 'inherit' });
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function generateProjectConfigAndInit(projectType: string) {
  let resolvedConfig; // Initialize with a default value
  if (projectType !== 'library') {
    switch (projectType) {
      case config.nextJsProject:
        resolvedConfig = await generateConfigNextApp();
        await initNatiwindNextApp(resolvedConfig);
        break;
      case config.expoProject:
        resolvedConfig = await generateConfigExpoApp();
        await initNatiwindExpoApp(resolvedConfig);
        break;
      case config.reactNativeCLIProject:
        resolvedConfig = await generateConfigRNApp();
        await initNatiwindRNApp(resolvedConfig);
        break;
      default:
        break;
    }

    await commonInitialization(projectType, resolvedConfig);
  } else {
    //write function to generate config for library
    await generateGluestackConfig();
  }
}

// const filesToOverride = (projectType: string) => {
//   switch (projectType) {
//     case config.nextJsProject:
//       return [
//         'next.config(.mjs/.js)',
//         'tailwind.config.js',
//         'global.css',
//         'tsconfig.json',
//       ];
//     case config.expoProject:
//       return [
//         'babel.config.js',
//         'metro.config.js',
//         'tailwind.config.js',
//         'global.css',
//         'tsconfig.json',
//       ];
//     case config.reactNativeCLIProject:
//       return [
//         'babel.config.js',
//         'metro.config.js',
//         'global.css',
//         'tsconfig.json',
//       ];
//     default:
//       return [];
//   }
// };

// function statementLength(statement: string) {
//   return statement.length;
// }

// async function overrideWarning(files: string[]) {
//   const boxLength = 90;
//   console.log(`\x1b[33m
//   ┌${'─'.repeat(boxLength)}┐
//   │                                                                                          │
//   │ WARNING: Overriding Files                                                                │
//   │                                                                                          │
//   │  The command you've run is attempting to override certain files in your project,         │
//   │  if already exist. Here's what's happening:                                              │
//   │                                                                                          │
// ${files
//   .map(
//     (file) =>
//       `  │  - ${
//         '[' + file + ']'.padEnd(boxLength - statementLength(file) - 7)
//       }  │`
//   )
//   .join('\n')}
//   │                                                                                          │
//   └${'─'.repeat(boxLength)}┘
//   \x1b[0m`);

//   const confirmInput = await confirm({
//     message: `\x1b[33mProceed with caution. Make sure to commit your changes before proceeding. Continue?
//     \x1b[0m`,
//   });
//   if (confirmInput === false) {
//     log.info(
//       'Skipping the step. Please refer docs for making the changes manually --> \x1b[33mhttps://gluestack.io/ui/nativewind/docs/getting-started/installation\x1b[0m'
//     );
//   }
//   return confirmInput;
// }

export { InitializeGlueStack };
