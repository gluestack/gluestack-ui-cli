import * as path from 'path';
import { pathExists } from 'fs-extra';
import fg from 'fast-glob';
import {
  RawConfig,
  NextResolvedConfig,
  PROJECT_SHARED_IGNORE,
} from './config-types';
import { findDirectory, generateConfig, getConfigPath } from '.';
import { config } from '../../config';

const _currDir = process.cwd();
//next project type initialization
async function getNextProjectType(cwd: string): Promise<string | undefined> {
  const files = await fg.glob('**/*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  const isNextProject = files.find((file) => file.startsWith('next.config.'));
  if (!isNextProject) {
    return undefined;
  }

  const isUsingSrcDir = await pathExists(path.resolve(cwd, 'src'));
  const isUsingAppDir = await pathExists(
    path.resolve(cwd, `${isUsingSrcDir ? 'src/' : ''}app`)
  );

  if (isUsingAppDir) {
    return isUsingSrcDir ? 'next-app-src' : 'next-app';
  }

  return isUsingSrcDir ? 'next-pages-src' : 'next-pages';
}

async function resolvedNextJsPaths(resultConfig: NextResolvedConfig) {
  const resolvedNextJsPaths = {
    tailwind: {
      config: path.resolve(_currDir, resultConfig.tailwind.config),
      css: path.resolve(_currDir, resultConfig.tailwind.css),
    },
    config: {
      postCssConfig: path.resolve(
        _currDir,
        resultConfig.config.postCssConfig || ''
      ),
      nextConfig: path.resolve(_currDir, resultConfig.config.nextConfig || ''),
      tsConfig: path.resolve(_currDir, resultConfig.config.tsConfig || ''),
    },
    app: {
      entry: path.resolve(_currDir, resultConfig.app.entry || ''),
      type: resultConfig?.app?.type,
      registry: resultConfig?.app?.registry,
    },
  };
  return resolvedNextJsPaths;
}

async function generateConfigNextApp(): Promise<NextResolvedConfig> {
  const projectType = await getNextProjectType(_currDir);
  const entryPath = await getConfigPath(['**/*layout.*', '**/*_app.*']);
  const globalCssPath = await getConfigPath([
    '**/*globals.css',
    '**/*global.css',
  ]);
  const tailwindConfigPath = await getConfigPath(['tailwind.config.*']);
  const postCssConfigPath = await getConfigPath(['postcss.config.*']);
  const nextConfigPath = await getConfigPath(['next.config.*']);
  const tsConfigPath = await getConfigPath(['tsconfig.*']);
  let registryPath = '';
  if (projectType?.includes('app')) {
    const appDirectory = findDirectory(_currDir, ['src/app', 'app']);
    registryPath = path.join(_currDir, appDirectory, 'registry.tsx');
  }

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
  const resolvedGluestackConfig: NextResolvedConfig = {
    tailwind: {
      config: tailwindConfigPath.length
        ? tailwindConfigPath
        : 'tailwind.config.js',
      css: globalCssPath.length ? globalCssPath : 'global.css',
    },
    config: {
      postCssConfig: postCssConfigPath.length
        ? postCssConfigPath
        : 'postcss.config.js',
      nextConfig: nextConfigPath.length ? nextConfigPath : 'next.config.js',
      tsConfig: tsConfigPath.length ? tsConfigPath : 'tsconfig.json',
    },
    app: {
      type: projectType,
      entry: entryPath,
      registry: registryPath,
    },
  };

  generateConfig(gluestackConfig);
  return await resolvedNextJsPaths(resolvedGluestackConfig);
}

export { generateConfigNextApp };
