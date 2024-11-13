import * as path from 'path';
import fg from 'fast-glob';
import { pathExists, readFile, writeFile } from 'fs-extra';
import { config } from '../../config';
import { findDirectory, generateConfig, getFilePath } from '.';
import {
  RawConfig,
  NextResolvedConfig,
  PROJECT_SHARED_IGNORE,
} from './config-types';
import { join, relative } from 'path';
import { execSync } from 'child_process';
import { log } from '@clack/prompts';
import { ensureFilesPromise } from '..';
import { commonInitialization } from '../init';
import { addReactNativeWebPatch } from '../init/addReactNativeWebPatch';

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

//project specific initialization: nextjs
async function initNatiwindNextApp(
  resolvedConfig: NextResolvedConfig,
  permission: boolean,
  isNextjs15: boolean | undefined
) {
  try {
    const NextTransformer = join(
      __dirname,
      `${config.codeModesDir}/${config.nextJsProject}`
    );
    const nextConfigPath = resolvedConfig.config.nextConfig;

    let nextTransformerPath = '';
    let fileType = '';

    if (isNextjs15) {
      await addReactNativeWebPatch();
    }
    if (nextConfigPath?.endsWith('.mjs')) {
      fileType = 'mjs';
    } else if (nextConfigPath?.endsWith('.js')) {
      fileType = 'js';
    } else if (nextConfigPath?.endsWith('.ts')) {
      fileType = 'ts';
    }
    nextTransformerPath = join(
      `${NextTransformer}/next-config-${fileType}-transform.ts`
    );

    if (nextTransformerPath && nextConfigPath) {
      execSync(`npx jscodeshift -t ${nextTransformerPath}  ${nextConfigPath}`);
    }
    if (
      resolvedConfig.app?.entry?.includes('layout') &&
      resolvedConfig.app.registry
    ) {
      // if app router add registry file to root
      const registryPath = isNextjs15
        ? '/nextjs/next15/registry.tsx'
        : '/common/registry.tsx';
      const registryContent = await readFile(
        join(__dirname, `${config.templatesDir}`, registryPath),
        'utf8'
      );
      await writeFile(resolvedConfig.app.registry, registryContent, 'utf8');
    }
    if (resolvedConfig.app?.entry?.includes('_app')) {
      const pageDirPath = path.dirname(resolvedConfig.app.entry);
      const docsPagePath = join(pageDirPath, '_document.tsx');
      const transformerPath = join(
        `${NextTransformer}/next-document-update-transform.ts`
      );
      execSync(`npx jscodeshift -t ${transformerPath} ${docsPagePath}`);
    }

    const options = JSON.stringify(resolvedConfig);
    const transformerPath = join(
      `${NextTransformer}/next-add-provider-transform.ts --config='${options}'`
    );
    const rawCssPath = relative(_currDir, resolvedConfig.tailwind.css);
    const cssImportPath = '@/'.concat(rawCssPath);
    execSync(
      `npx jscodeshift -t ${transformerPath}  ${resolvedConfig.app.entry} --componentsPath='${config.writableComponentsPath}' --cssImportPath='${cssImportPath}'`
    );
    await commonInitialization(
      config.nextJsProject,
      resolvedConfig,
      permission
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${err as Error}\x1b[0m`);
  }
}

async function generateConfigNextApp(
  permission: boolean,
  isNextjs15: boolean | undefined
) {
  const projectType = await getNextProjectType(_currDir);
  const entryPath = await getFilePath(['**/*layout.*', '**/*_app.*']);
  const globalCssPath = await getFilePath([
    '**/*globals.css',
    '**/*global.css',
  ]);
  const tailwindConfigPath = await getFilePath(['tailwind.config.*']);
  const postCssConfigPath = await getFilePath(['postcss.config.*']);
  const nextConfigPath = await getFilePath(['next.config.*']);

  const tsConfigPath = await getFilePath(['tsconfig.*']);
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
  const resolvedConfig = await resolvedNextJsPaths(resolvedGluestackConfig);
  const filesTobeEnsured = [
    resolvedConfig.app.registry ?? '',
    resolvedConfig.config.tsConfig,
    resolvedConfig.tailwind.css,
    join(_currDir, 'nativewind-env.d.ts'),
  ];
  const filesEnsured = await ensureFilesPromise(filesTobeEnsured);
  if (permission && filesEnsured) {
    await initNatiwindNextApp(resolvedConfig, permission, isNextjs15);
  }
}

export { generateConfigNextApp };
