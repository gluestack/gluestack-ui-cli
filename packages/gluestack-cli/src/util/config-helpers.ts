import * as fs from 'fs';
import * as path from 'path';
import { log } from '@clack/prompts';
import { config } from '../config';
import { projectRootPath } from '.';
import { readdir, stat, pathExists } from 'fs-extra';
import { dirname, join } from 'path';
import { findFilePath } from './file-helpers';
import { cosmiconfig } from 'cosmiconfig';
import { z } from 'zod';
import fg from 'fast-glob';

const currDir = process.cwd();

const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const possibleIndexFiles = ['_app', 'index', 'App'];
const possibleDirectories = ['src', 'pages', 'app'];

export interface ProjectConfig {
  entryFilePaths: string[];
}

const NEXT_PROJECT_TYPES = [
  'next-app',
  'next-app-src',
  'next-pages',
  'next-pages-src',
] as const;
type NextProjectType = (typeof NEXT_PROJECT_TYPES)[number];

const EXPO_PROJECT_TYPES = ['expo-app', 'expo-app-src'] as const;
type ExpoProjectType = (typeof EXPO_PROJECT_TYPES)[number];

const PROJECT_SHARED_IGNORE = [
  '**/node_modules/**',
  '.next',
  'public',
  'dist',
  'build',
];

export const rawConfigSchema = z
  .object({
    style: z.string(),
    tailwindConfig: z.string().default(''),
    css: z.string().default(''),
    config: z.object({
      postCssConfig: z.string().optional(),
      tsConfig: z.string().optional(),
      nextConfig: z.string().optional(),
    }),
  })
  .strict();

export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    tailwindConfig: z.string(),
    css: z.string(),
    config: z.object({
      postCssConfig: z.string().optional(),
      tsConfig: z.string().optional(),
      nextConfig: z.string().optional(),
    }),
  }),
});
export type Config = z.infer<typeof configSchema>;

const explorer = cosmiconfig('gluestack-ui', {
  searchPlaces: ['gluestack-ui.json'],
});

const checkIfProviderExists = async (
  dir: string,
  targetPath: string
): Promise<boolean> => {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const filePath = join(dir, file);
      const stats = await stat(filePath);
      if (filePath.endsWith(targetPath)) {
        // Get the directory of the provider file
        const providerDir = dirname(filePath);
        // Remove `config.UIconfigPath` from `providerDir`
        const writableComponentsPath = providerDir.replace(
          config.providerComponent,
          ''
        );
        // Update `config.writableComponentsPath`
        config.writableComponentsPath = writableComponentsPath;
        return true;
      } else if (
        stats.isDirectory() &&
        file !== 'node_modules' &&
        file !== 'build' &&
        file !== '.next'
      ) {
        const pathExists = await checkIfProviderExists(filePath, targetPath);
        if (pathExists) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    return false;
  }
};

async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd);
    if (!configResult) {
      return null;
    }
    return rawConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Invalid configuration found in ${cwd}/gluestack-ui.json.`);
  }
}

function getEntryPathAndComponentsPath(): {
  entryPath: string[];
  componentsPath: string[];
} {
  let entryPath: string[] = [];
  let componentsPath: string[] = [];

  let FileExists: string[] = [];
  fileExtensions.forEach((ext) => {
    possibleIndexFiles.map((file) => {
      if (fs.existsSync(path.join(projectRootPath, `${file}${ext}`))) {
        FileExists.push(file);
      }
    });
  });
  // Check if any of the possible index files exist
  if (FileExists) {
    FileExists.forEach((file) => {
      entryPath.push(`./${file}.{tsx,jsx,ts,js}`);
    });
  }
  // Check if "src", "pages", or "app" directories exist
  possibleDirectories.forEach((dir) => {
    if (fs.existsSync(path.join(projectRootPath, dir))) {
      entryPath.push(`./${dir}/**/*.{tsx,jsx,ts,js}`);
    }
  });
  if (fs.existsSync(config.writableComponentsPath)) {
    componentsPath.push('./components/**/*.{tsx,jsx,ts,js}');
  }
  return { entryPath, componentsPath };
}

async function getExistingComponentStyle() {
  try {
    const configPath = await findFilePath(projectRootPath, config.UIconfigPath);
    if (configPath) {
      const fileContent: string = fs.readFileSync(configPath, 'utf8');
      // Define a regular expression pattern to match import statements
      const importPattern: RegExp = new RegExp(
        `import {\\s*\\w+\\s*} from ['"]nativewind['"]`,
        'g'
      );
      if (importPattern.test(fileContent)) {
        config.style = config.nativeWindRootPath;
        return config.nativeWindRootPath;
      } else {
        config.style = config.gluestackStyleRootPath;
        return config.gluestackStyleRootPath;
      }
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
}

async function getNextProjectType(
  cwd: string
): Promise<NextProjectType | null> {
  const files = await fg.glob('**/*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  const isNextProject = files.find((file) => file.startsWith('next.config.'));
  if (!isNextProject) {
    return null;
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

async function getGlobalCssFile(cwd: string) {
  const files = await fg.glob('**/*/globals.css', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (!files.length) {
    // return null;
    throw new Error('No globals.css file found in the project.');
  }

  return files[0];
}

async function getTailwindConfig(cwd: string) {
  const files = await fg.glob('tailwind.config.*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (!files.length) {
    throw new Error('No tailwind.config.* file found in the project.');
  }

  return files[0];
}

async function getPostCssConfig(cwd: string) {
  const files = await fg.glob('postcss.config.*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });
  if (!files.length) {
    throw new Error('No postcss.config.* file found in the project.');
  }
  return files[0];
}

async function generateConfigNextApp() {
  const projectType = await getNextProjectType(currDir);
  const globalCssPath = await getGlobalCssFile(currDir);
  const tailwindConfigPath = await getTailwindConfig(currDir);
  const postCssConfigPath = await getPostCssConfig(currDir);
  const gluestackConfig: RawConfig = {
    style: 'v2',
    tailwindConfig: tailwindConfigPath,
    css: globalCssPath,
    config: {
      postCssConfig: postCssConfigPath,
      nextConfig: '',
      tsConfig: '',
    },
  };
  generateConfig(gluestackConfig);
  return await resolvedPaths(gluestackConfig);
}
async function resolvedPaths(resultConfig: RawConfig) {
  const resolvedTailwindConfig = path.resolve(
    currDir,
    resultConfig.tailwindConfig
  );
  const resolvedCss = path.resolve(currDir, resultConfig.css);
  const resolvedPostCssConfig = path.resolve(
    currDir,
    resultConfig.config.postCssConfig || ''
  );
  const resolvedNextConfig = path.resolve(
    currDir,
    resultConfig.config.nextConfig || ''
  );
  const resolvedTsConfig = path.resolve(
    currDir,
    resultConfig.config.tsConfig || ''
  );
  const resolvedPaths = {
    tailwindConfig: resolvedTailwindConfig,
    css: resolvedCss,
    config: {
      postCssConfig: resolvedPostCssConfig,
      nextConfig: resolvedNextConfig,
      tsConfig: resolvedTsConfig,
    },
  };
  return resolvedPaths;
}

async function generateConfig(resultConfig: RawConfig) {
  const targetPath = path.resolve(currDir, 'gluestack-ui.config.json');
  fs.writeFileSync(targetPath, JSON.stringify(resultConfig, null, 2), 'utf8');
}

export {
  getExistingComponentStyle,
  checkIfProviderExists,
  getEntryPathAndComponentsPath,
  getNextProjectType,
  getRawConfig,
  generateConfigNextApp,
};
