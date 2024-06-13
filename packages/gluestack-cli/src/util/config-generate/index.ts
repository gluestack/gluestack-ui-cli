import * as fs from 'fs';
import * as path from 'path';
import { config } from '../../config';
import { projectRootPath } from '..';
import { cosmiconfig } from 'cosmiconfig';
import fg from 'fast-glob';
import {
  RawConfig,
  RawConfigSchema,
  PROJECT_SHARED_IGNORE,
} from './config-types';

const currDir = process.cwd();

const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const possibleIndexFiles = ['_app', 'index', 'App'];
const possibleDirectories = ['src', 'pages', 'app', 'components'];

const explorer = cosmiconfig('gluestack-ui', {
  searchPlaces: ['gluestack-ui.json'],
});

async function checkIfInitialized(cwd: string): Promise<boolean> {
  try {
    const initializeStatus = await fg.glob('gluestack-ui.config.json', {
      cwd,
      deep: 3,
      ignore: PROJECT_SHARED_IGNORE,
    });
    if (initializeStatus.length) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

async function getComponentsPath(): Promise<string> {
  const componentsPath = await fg.glob(
    `**/*${config.providerComponent}/index.tsx`,
    {
      cwd: currDir,
      deep: 8,
      ignore: PROJECT_SHARED_IGNORE,
    }
  );

  if (!componentsPath.length) {
    //handle this case when CLI couldn't locate the components path
    return '';
  }
  const resolvedComponentsPath = componentsPath[0].replace(
    `/${config.providerComponent}/index.tsx`,
    ''
  );
  return resolvedComponentsPath;
}

async function checkConfigSchema(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd);
    if (!configResult) {
      return null;
    }
    return RawConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Invalid configuration found in ${cwd}/gluestack-ui.json.`);
  }
}

function getEntryPathAndComponentsPath(): {
  entryPath: string[];
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
  // Check if "src", "pages", "app" or "component" directories exist
  possibleDirectories.forEach((dir) => {
    if (fs.existsSync(path.join(projectRootPath, dir))) {
      entryPath.push(`./${dir}/**/*.{tsx,jsx,ts,js}`);
    }
  });
  if (fs.existsSync(config.writableComponentsPath)) {
    const path = config.writableComponentsPath.split('/');
    if (!entryPath.includes(`./${path[0]}/**/*.{tsx,jsx,ts,js}`)) {
      componentsPath.push(`./${path[0]}/**/*.{tsx,jsx,ts,js}`);
    }
  }
  entryPath = [...entryPath, ...componentsPath];
  return { entryPath };
}

async function getConfigPath(files: string[]) {
  const filePath = await fg.glob(files, {
    cwd: currDir,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });
  if (!filePath.length) {
    return '';
  }
  return filePath[0];
}

async function generateConfig(resultConfig: RawConfig) {
  const targetPath = path.resolve(currDir, 'gluestack-ui.config.json');
  fs.writeFileSync(targetPath, JSON.stringify(resultConfig, null, 2), 'utf8');
}

export {
  checkIfInitialized,
  getEntryPathAndComponentsPath,
  generateConfig,
  getConfigPath,
  getComponentsPath,
  currDir,
};
