import * as path from 'path';
import fg from 'fast-glob';
import * as fs from 'fs';
import { config } from '../../config';
import { generateConfig, getConfigPath } from '.';
import {
  RawConfig,
  PROJECT_SHARED_IGNORE,
  ExpoResolvedConfig,
} from './config-types';

const _currDir = process.cwd();

// expo project type initialization
async function getExpoProjectType(cwd: string): Promise<string | undefined> {
  const files = await fg.glob('**/*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  const isExpoProject = files.find(
    (file) =>
      file.startsWith('app.json') ||
      file.startsWith('app.config.js') ||
      file.startsWith('app.config.ts')
  );
  if (!isExpoProject) {
    return undefined;
  }

  const expoLayoutPath = fs.existsSync('app')
    ? 'app/_layout.*'
    : fs.existsSync('src/app')
      ? 'src/app/_layout.*'
      : '**/*_layout.*';

  const isUsingExpoRouter = await getConfigPath([expoLayoutPath]);
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
      type: resultConfig?.app?.type,
    },
  };
  return resolvedExpoPaths;
}

async function generateConfigExpoApp(): Promise<ExpoResolvedConfig> {
  const projectType = await getExpoProjectType(_currDir);
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
