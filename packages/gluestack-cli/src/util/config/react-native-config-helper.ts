import * as path from 'path';
import { generateConfig, getFilePath } from '.';
import { RawConfig, ReactNativeResolvedConfig } from './config-types';

const _currDir = process.cwd();

//react-native project type initialization
async function resolvedReactNativePaths(
  resultConfig: ReactNativeResolvedConfig
) {
  const resolvedReactNativePaths = {
    tailwind: {
      config: path.resolve(_currDir, resultConfig.tailwind.config),
      css: path.resolve(_currDir, resultConfig.tailwind.css),
    },
    config: {
      babelConfig: path.resolve(
        _currDir,
        resultConfig.config.babelConfig || ''
      ),
      metroConfig: path.resolve(
        _currDir,
        resultConfig.config.metroConfig || ''
      ),
      tsConfig: path.resolve(_currDir, resultConfig.config.tsConfig || ''),
    },
    app: {
      entry: path.resolve(_currDir, resultConfig.app.entry || ''),
    },
  };
  return resolvedReactNativePaths;
}

async function generateConfigRNApp() {
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
      entry: path.resolve(_currDir, entryPath),
    },
  };

  generateConfig(gluestackConfig);
  return await resolvedReactNativePaths(resolvedGluestackConfig);
}

export { generateConfigRNApp };
