import * as path from 'path';
import { generateConfig, getFilePath, pathResolver } from '.';
import { RawConfig, ReactNativeResolvedConfig } from './config-types';
import { ensureFilesPromise, getRelativePath } from '..';
import { config } from '../../config';
import { join } from 'path';
import { execSync } from 'child_process';
import { log } from '@clack/prompts';
import { commonInitialization } from '../init';

//react-native project type initialization
async function resolvedReactNativePaths(
  resultConfig: ReactNativeResolvedConfig
) {
  const resolvedReactNativePaths = {
    tailwind: {
      config: pathResolver(resultConfig.tailwind.config),
      css: pathResolver(resultConfig.tailwind.css),
    },
    config: {
      babelConfig: pathResolver(resultConfig.config.babelConfig || ''),
      metroConfig: pathResolver(resultConfig.config.metroConfig || ''),
      tsConfig: pathResolver(resultConfig.config.tsConfig || ''),
    },
    app: {
      entry: pathResolver(resultConfig.app.entry || ''),
    },
  };
  return resolvedReactNativePaths;
}

//project specific initialization: react-native
async function initNatiwindRNApp(
  resolvedConfig: ReactNativeResolvedConfig,
  permission: boolean
) {
  try {
    const relativeCSSImport = getRelativePath({
      sourcePath: resolvedConfig.app.entry,
      targetPath: resolvedConfig.tailwind.css,
    });
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

    execSync(
      `npx jscodeshift -t ${BabelTransformerPath}  ${resolvedConfig.config.babelConfig} --config='${JSON.stringify(resolvedConfig)}'`
    );
    execSync(
      `npx jscodeshift -t ${metroTransformerPath}  ${resolvedConfig.config.metroConfig}`
    );
    execSync(
      `npx  jscodeshift -t ${addProviderTransformerPath} ${resolvedConfig.app.entry}  --componentsPath='${config.writableComponentsPath}' --cssImportPath='${relativeCSSImport}'`
    );
    await commonInitialization(
      config.reactNativeCLIProject,
      resolvedConfig,
      permission
    );

    execSync('npx pod-install', { stdio: 'inherit' });
  } catch (err) {
    throw new Error((err as Error).message);
  }
}

async function generateConfigRNApp(permission: boolean) {
  const entryPath = await getFilePath(['**/*App.*']);
  const globalCssPath = await getFilePath([
    '**/*globals.css',
    '**/*global.css',
  ]);
  const tailwindConfigPath = await getFilePath(['tailwind.config.*']);
  const BabelConfigPath = await getFilePath(['babel.config.*']);
  const MetroConfigPath = await getFilePath(['metro.config.*']);
  const tsConfigPath = await getFilePath(['tsconfig.*']);

  const gluestackConfig: RawConfig = {
    tailwind: {
      config: tailwindConfigPath.length
        ? tailwindConfigPath
        : 'tailwind.config.js',
      css: globalCssPath.length ? globalCssPath : 'global.css',
    },
    app: {
      entry: entryPath,
      components: config.writableComponentsPath,
    },
  };
  const resolvedGluestackConfig = {
    tailwind: {
      config: tailwindConfigPath.length
        ? tailwindConfigPath
        : 'tailwind.config.js',
      css: globalCssPath.length ? globalCssPath : 'global.css',
    },
    config: {
      babelConfig: BabelConfigPath.length ? BabelConfigPath : 'babel.config.js',
      metroConfig: MetroConfigPath.length ? MetroConfigPath : 'metro.config.js',
      tsConfig: tsConfigPath.length ? tsConfigPath : 'tsconfig.json',
    },
    app: {
      entry: pathResolver(entryPath),
    },
  };

  generateConfig(gluestackConfig);
  const resolvedConfig = await resolvedReactNativePaths(
    resolvedGluestackConfig
  );
  const filesTobeEnsured = [
    resolvedConfig.config.babelConfig,
    resolvedConfig.config.metroConfig,
    resolvedConfig.config.tsConfig,
    resolvedConfig.tailwind.css,
    pathResolver('nativewind-env.d.ts'),
  ];
  const filesEnsured = await ensureFilesPromise(filesTobeEnsured);
  if (permission && filesEnsured) {
    if (permission) {
      await initNatiwindRNApp(resolvedConfig, permission);
    }
  }
}

export { generateConfigRNApp };
