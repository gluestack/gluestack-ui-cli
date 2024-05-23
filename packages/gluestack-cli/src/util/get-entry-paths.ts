import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';

const rootPath: string = process.cwd();
const fileExtensions = ['.tsx', '.jsx', '.ts', '.js'];
const possibleIndexFiles = ['_app', 'index', 'App'];
const possibleDirectories = ['src', 'pages', 'app'];

function getEntryPathAndComponentsPath(): {
  entryPath: string[];
  componentsPath: string[];
} {
  let entryPath: string[] = [];
  let componentsPath: string[] = [];

  let FileExists: string[] = [];
  fileExtensions.forEach((ext) => {
    possibleIndexFiles.map((file) => {
      if (fs.existsSync(path.join(rootPath, `${file}${ext}`))) {
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
    if (fs.existsSync(path.join(rootPath, dir))) {
      entryPath.push(`./${dir}/**/*.{tsx,jsx,ts,js}`);
    }
  });
  if (fs.existsSync(config.writableComponentsPath)) {
    componentsPath.push('./components/**/*.{tsx,jsx,ts,js}');
  }
  return { entryPath, componentsPath };
}
export interface ProjectConfig {
  entryFilePaths: string[];
}

const projectConfig: { [key: string]: ProjectConfig } = {
  expo: {
    entryFilePaths: ['App.js', 'src/App.js'], // Example of multiple possible paths
  },
  nextjs: {
    entryFilePaths: ['pages/_app.js', 'pages/index.js', 'src/pages/_app.tsx'],
  },
  'react-native-cli': {
    entryFilePaths: ['index.jsx', 'App.tsx'],
  },
};

export { getEntryPathAndComponentsPath };
