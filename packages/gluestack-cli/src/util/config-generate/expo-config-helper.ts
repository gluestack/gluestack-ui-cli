import * as path from 'path';
import fg from 'fast-glob';
import {
  RawConfig,
  PROJECT_SHARED_IGNORE,
  ExpoResolvedConfig,
} from './config-types';
import { currDir, generateConfig, getConfigPath } from '.';
import { config } from '../../config';

// expo project type initialization
async function getExpoProjectType(cwd: string): Promise<string | undefined> {
  const files = await fg.glob('**/*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  const isExpoProject = files.find((file) => file.startsWith('app.json'));
  if (!isExpoProject) {
    return undefined;
  }

  const isUsingExpoRouter = await getConfigPath(['app/_layout.*']);
  const isUsingDefaultExpo = await getConfigPath(['App.*']);
  return isUsingExpoRouter
    ? 'expo-router'
    : isUsingDefaultExpo
    ? 'expo-default'
    : undefined;
}

async function resolvedExpoPaths(resultConfig: ExpoResolvedConfig) {
  const resolvedExpoPaths = {
    tailwind: {
      config: path.resolve(currDir, resultConfig.tailwind.config),
      css: path.resolve(currDir, resultConfig.tailwind.css),
    },
    config: {
      babelConfig: path.resolve(currDir, resultConfig.config.babelConfig || ''),
      metroConfig: path.resolve(currDir, resultConfig.config.metroConfig || ''),
      tsConfig: path.resolve(currDir, resultConfig.config.tsConfig || ''),
    },
    app: {
      entry: path.resolve(currDir, resultConfig.app.entry || ''),
      type: resultConfig?.app?.type,
    },
  };
  return resolvedExpoPaths;
}

async function generateConfigExpoApp(): Promise<ExpoResolvedConfig> {
  const projectType = await getExpoProjectType(currDir);
  const entryPath = await getConfigPath(['**/*_layout.*', '**/*App.*']);
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
      // write a function to get current components path
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
      entry: entryPath,
      type: projectType,
    },
  };
  generateConfig(gluestackConfig);
  return await resolvedExpoPaths(resolvedGluestackConfig);
}

export { generateConfigExpoApp };
