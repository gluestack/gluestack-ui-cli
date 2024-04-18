import { generateConfigAndInstallDependencies } from '../create-config';
import { config } from '../../config';
import os from 'os';
import {
  detectProjectType,
  cloneRepositoryAtRoot,
  getAdditionalDependencies,
  checkIfFolderExists,
} from '..';
import fs, { copy, ensureFile, existsSync } from 'fs-extra';
import { join } from 'path';
import { log, confirm } from '@clack/prompts';
import { promisify } from 'util';
import { exec, execSync } from 'child_process';
import { getEntryPathAndComponentsPath } from '../get-entry-paths';
import { createBox } from '../../utils';

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
    //defaulting to nativeWind
    config.style = config.nativeWindRootPath;
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
      console.log(`\n\x1b[34mPlease follow these steps to complete the setup of gluestack-ui in your project entry file:
      1. Wrap your app with GluestackUIProvider.
      2. Import global.css\x1b[0m`);
      console.log(`\n\x1b[34mExample:\x1b[0m`);
      createBox(config.demoCode);
      log.step(
        'Please refer the above link for more details --> \x1b[33mhttps://gluestack.io/ui/nativewind/docs/overview/introduction \x1b[0m'
      );
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
    const confirmInput = await overrideWarning(filesToOverride(projectType));
    if (confirmInput === true) {
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
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

//refactor this
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
    const globalCSSPath = join(_currDir, 'global.css');
    const globalCSSContent = await fs.readFile(
      join(__dirname, config.templatesDir, 'common/global.css'),
      'utf8'
    );
    if (fs.existsSync(globalCSSPath)) {
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
    for (const file of filesAndFolders) {
      await fs.copy(join(resourcePath, file), join(_currDir, file), {
        overwrite: true,
      });
    }
    const tailwindConfigRootPath = join(
      _homeDir,
      config.gluestackDir,
      config.tailwindConfigRootPath
    );
    const tailwindConfigPath = join(_currDir, 'tailwind.config.js');
    addtailwindConfigFile(tailwindConfigRootPath, tailwindConfigPath);
    await updateTSConfigPaths(projectType);
    // add or update global.css (check throughout the project for global.css and update it or create it)
    await generateGlobalCSS();
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

const addtailwindConfigFile = async (
  resourcePath: string,
  targetPath: string
) => {
  try {
    await fs.copy(resourcePath, targetPath);
    // Codemod to update tailwind.config.js usage
    const { entryPath, componentsPath } = getEntryPathAndComponentsPath();
    const newPaths = entryPath.concat(componentsPath);
    const allNewPaths = JSON.stringify(newPaths);
    const transformerPath = join(
      __dirname,
      `${config.codeModesDir}/tailwind-config-transform.ts`
    );
    exec(
      `npx jscodeshift -t ${transformerPath}  ${targetPath} --paths='${allNewPaths}'`
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
};

async function initNatiwindInNextJs() {
  try {
    await ensureFile(join(_currDir, 'next.config.mjs'));
    const nextConfigPath = join(_currDir, 'next.config.mjs');
    const nextTransformerPath = join(
      __dirname,
      `${config.codeModesDir}/${config.nextJsProject}/next-config-transform.ts`
    );
    exec(`npx jscodeshift -t ${nextTransformerPath}  ${nextConfigPath}`);
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInExpo() {
  try {
    await ensureFile(join(_currDir, 'babel.config.js'));
    const babelConfigPath = join(_currDir, 'babel.config.js');
    const BabeltransformerPath = join(
      __dirname,
      `${config.codeModesDir}/${config.expoProject}/babel-config-transform.ts`
    );
    //metro-config-transform
    if (existsSync(join(_currDir, 'metro.config.js'))) {
      const metroConfigPath = join(_currDir, 'metro.config.js');
      const metroTransformerPath = join(
        __dirname,
        `${config.codeModesDir}/${config.expoProject}/metro-config-transform.ts`
      );
      exec(`npx jscodeshift -t ${metroTransformerPath}  ${metroConfigPath}`);
      exec(`npx jscodeshift -t ${BabeltransformerPath}  ${babelConfigPath}`);
    } else {
      await fs.ensureFile(join(_currDir, 'metro.config.js'));
      copy(
        join(__dirname, `${config.templatesDir}/common/metro.config-expo.js`),
        join(_currDir, 'metro.config.js')
      );
      exec(`npx jscodeshift -t ${BabeltransformerPath}  ${babelConfigPath}`);
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function initNatiwindInReactNativeCLI() {
  try {
    await ensureFile(join(_currDir, 'babel.config.js'));
    await ensureFile(join(_currDir, 'metro.config.js'));

    const babelConfigPath = join(_currDir, 'babel.config.js');
    const metroConfigPath = join(_currDir, 'metro.config.js');

    const BabelTransformerPath = join(
      __dirname,
      `${config.codeModesDir}/${config.reactNativeCLIProject}/babel-config-transform.ts`
    );
    const metroTransformerPath = join(
      __dirname,
      `${config.codeModesDir}/${config.reactNativeCLIProject}/metro-config-transform.ts`
    );
    exec(`npx jscodeshift -t ${BabelTransformerPath}  ${babelConfigPath}`);
    exec(`npx jscodeshift -t ${metroTransformerPath}  ${metroConfigPath}`);
    execSync('npx pod-install', { stdio: 'inherit' });
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}
const filesToOverride = (projectType: string) => {
  switch (projectType) {
    case config.nextJsProject:
      return [
        'next.config.mjs',
        'tailwind.config.js',
        'global.css',
        'tsconfig.json',
      ];
    case config.expoProject:
      return [
        'babel.config.js',
        'metro.config.js',
        'tailwind.config.js',
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

async function overrideWarning(files: string[]) {
  const confirmInput = await confirm({
    message: `\x1b[33mWARNING: Overriding Files

    The command you've run is attempting to override certain files in your project, if already exist. Here's what's happening:
    
   ${files.map((file) => `File - [${file}]`).join('\n')}
    
    Proceed with caution. Make sure to commit your changes before proceeding.
    \x1b[0m`,
  });
  if (confirmInput === false) {
    log.info(
      'Skipping the step. Please refer docs for making the changes manually --> \x1b[33mhttps://gluestack.io/ui/nativewind/docs/getting-started/installation\x1b[0m'
    );
  }
  return confirmInput;
}

export { InitializeGlueStack };
