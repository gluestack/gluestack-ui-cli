import * as fs from 'fs';
import * as path from 'path';
import { config } from '../config';
import { run as jscodeshift } from 'jscodeshift/src/Runner';

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

// Function to find entry files
function findEntryFiles(basePath: string): string[] {
  const entryFiles: string[] = [];

  // Check if the given path exists
  if (fs.existsSync(basePath)) {
    // Check files in the given path
    fs.readdirSync(basePath).forEach(async (file) => {
      const filePath = path.join(basePath, file);
      const isDirectory = fs.statSync(filePath).isDirectory();
      if (file === 'node_modules' || file === '.git' || file === 'build') {
        return;
      }

      // If it's a directory, recursively search inside
      if (isDirectory) {
        entryFiles.push(...findEntryFiles(filePath));
      } else {
        // Check if the file has one of the specified extensions
        const extension = path.extname(file);
        if (fileExtensions.includes(extension)) {
          // Check if the file's name matches any of the possible index files
          const fileName = path.basename(file, extension);
          if (possibleIndexFiles.includes(fileName)) {
            // Read the file content and check if it returns a JSX element
            const transformPath = path.join(
              __dirname,
              '../../template/template-codemods/add-provider-transform.ts'
            );
            let arr = [];
            arr.push(filePath);
            const res = await jscodeshift(transformPath, arr, {});
          }
        }
      }
    });
  }

  return entryFiles;
}
export { getEntryPathAndComponentsPath };
