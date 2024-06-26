import * as path from 'path';
import { RawConfig, ReactNativeResolvedConfig } from './config-types';
import { generateConfig, getConfigPath } from '.';
import { projectRootPath } from '..';

//react-native project type initialization
async function resolvedReactNativePaths(
  resultConfig: ReactNativeResolvedConfig
) {
  const resolvedReactNativePaths = {
    tailwind: {
      config: path.resolve(projectRootPath, resultConfig.tailwind.config),
      css: path.resolve(projectRootPath, resultConfig.tailwind.css),
    },
    config: {
      babelConfig: path.resolve(
        projectRootPath,
        resultConfig.config.babelConfig || ''
      ),
      metroConfig: path.resolve(
        projectRootPath,
        resultConfig.config.metroConfig || ''
      ),
      tsConfig: path.resolve(
        projectRootPath,
        resultConfig.config.tsConfig || ''
      ),
    },
    app: {
      entry: path.resolve(projectRootPath, resultConfig.app.entry || ''),
    },
  };
  return resolvedReactNativePaths;
}

async function generateConfigRNApp() {
  const entryPath = await getConfigPath(['**/*App.*']);
  const globalCssPath = await getConfigPath([
    '**/*globals.css',
    '**/*global.css',
  ]);
  const tailwindConfigPath = await getConfigPath(['tailwind.config.*']);
  const BabelConfigPath = await getConfigPath(['babel.config.*']);
  const MetroConfigPath = await getConfigPath(['metro.config.*']);
  const tsConfigPath = await getConfigPath(['tsconfig.*']);

  const gluestackConfig: RawConfig = {
    tailwind: {
      config: tailwindConfigPath.length
        ? tailwindConfigPath
        : 'tailwind.config.js',
      css: globalCssPath.length ? globalCssPath : 'global.css',
    },
    app: {
      entry: entryPath,
      components: 'components/ui',
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
      entry: path.resolve(projectRootPath, entryPath),
    },
  };

  generateConfig(gluestackConfig);
  return await resolvedReactNativePaths(resolvedGluestackConfig);
}

export { generateConfigRNApp };
