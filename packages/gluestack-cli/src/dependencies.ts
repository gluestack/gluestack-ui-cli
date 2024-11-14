import { join } from 'path';
import { config } from './config';
import { log } from '@clack/prompts';
import fs from 'fs-extra';
import os from 'os';

const __homeDir = os.homedir();

export interface Dependency {
  [key: string]: string;
}
export interface ComponentConfig {
  dependencies: Dependency;
  devDependencies?: Dependency;
  additionalComponents?: string[];
  hooks?: string[];
}

export interface Dependencies {
  [key: string]: ComponentConfig;
}

interface UIConfigJSON {
  components: Dependencies;
  IgnoredComponents: string[];
}

const projectBasedDependencies: Dependencies = {
  nextjs: {
    dependencies: {
      postcss: '',
      autoprefixer: '',
      'react-native-web': '',
      '@gluestack/ui-next-adapter': 'latest',
    },
    devDependencies: {
      '@types/react-native': '0.72.8',
    },
  },
  expo: {
    dependencies: {
      'react-native-reanimated': '',
    },
  },
  'react-native-cli': {
    dependencies: {
      'react-native-reanimated': '',
    },
    devDependencies: {
      'babel-plugin-module-resolver': '',
    },
  },
};

// Get dependency JSON
async function getDependencyJSON(): Promise<UIConfigJSON> {
  const dependencyJSONPath = join(
    __homeDir,
    config.gluestackDir,
    config.dependencyConfigPath
  );
  if (!fs.existsSync(dependencyJSONPath)) {
    log.error(
      `\x1b[31mError: Dependency JSON file not found at ${dependencyJSONPath}\x1b[0m`
    );
    process.exit;
  }
  const dependencyJSON = await fs.readJSON(dependencyJSONPath);
  return dependencyJSON;
}

// Get project based dependencies
async function getProjectBasedDependencies(
  projectType: string | undefined,
  style: string
) {
  try {
    if (
      style === config.nativeWindRootPath &&
      projectType &&
      projectType !== 'library'
    ) {
      return {
        dependencies: projectBasedDependencies[projectType].dependencies,
        devDependencies:
          projectBasedDependencies[projectType]?.devDependencies || {},
      };
    }
    return { dependencies: {}, devDependencies: {} };
  } catch (error) {
    throw new Error((error as Error).message);
  }
}

// Ignore components that are in development or not in supported list
const getIgnoredComponents = async (): Promise<string[]> => {
  const dependencyJSON = await getDependencyJSON();
  return dependencyJSON.IgnoredComponents;
};

// Get dependencies for a component
const getComponentDependencies = async (
  componentName: string
): Promise<ComponentConfig> => {
  const dependencyJSON = await getDependencyJSON();
  const config = dependencyJSON.components[componentName];
  if (!config) {
    return {
      dependencies: {},
      devDependencies: {},
      additionalComponents: [],
      hooks: [],
    };
  }
  return {
    dependencies: config.dependencies || {},
    devDependencies: config.devDependencies || {},
    additionalComponents: config.additionalComponents || [],
    hooks: config.hooks || [],
  };
};

export {
  getIgnoredComponents,
  getComponentDependencies,
  getProjectBasedDependencies,
};
