import * as fs from 'fs';
import * as path from 'path';

export function getEntryPathAndComponentsPath(): {
  entryPath: string[];
  componentsPath: string[];
} {
  const rootPath: string = process.cwd(); // Assuming the current directory is the root of the repository
  // Check if App.{tsx, jsx, ts, js} or index.{tsx, jsx, ts, js} exists in the root
  const appExtensions = ['.tsx', '.jsx', '.ts', '.js'];
  const indexExtensions = ['.tsx', '.jsx', '.ts', '.js'];

  const appFileExists: boolean = appExtensions.some((ext) =>
    fs.existsSync(path.join(rootPath, `App${ext}`))
  );
  const indexFileExists: boolean = indexExtensions.some((ext) =>
    fs.existsSync(path.join(rootPath, `index${ext}`))
  );

  let entryPath: string[] = [];
  if (appFileExists) {
    entryPath.push('./App.{tsx,jsx,ts,js}');
  }
  if (indexFileExists) {
    entryPath.push('./index.{tsx,jsx,ts,js}');
  }

  // Check if "src", "pages", or "app" directories exist
  const srcDirExists: boolean = fs.existsSync(path.join(rootPath, 'src'));
  const pagesDirExists: boolean = fs.existsSync(path.join(rootPath, 'pages'));
  const appDirExists: boolean = fs.existsSync(path.join(rootPath, 'app'));

  if (srcDirExists) {
    entryPath.push('./src/**/*.{tsx,jsx,ts,js}');
  }
  if (pagesDirExists) {
    entryPath.push('./pages/**/*.{tsx,jsx,ts,js}');
  }
  if (appDirExists) {
    entryPath.push('./app/**/*.{tsx,jsx,ts,js}');
  }

  // Check if components/ui path exists in the root
  const componentsUIPathExists: boolean = fs.existsSync(
    path.join(rootPath, 'components', 'ui')
  );
  let componentsPath: string[] = [];
  if (componentsUIPathExists) {
    componentsPath.push('./components/**/*.{sx,jsx,ts,js}');
  }

  return { entryPath, componentsPath };
}
