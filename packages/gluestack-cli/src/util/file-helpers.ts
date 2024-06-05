import path, { join, parse } from 'path';
import fs, { readdir, stat } from 'fs-extra';

const findFilePath = async (
  dir: string,
  targetEnding: string
): Promise<string | null> => {
  try {
    const files = await readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = await stat(filePath);
      if (filePath.endsWith(targetEnding)) {
        return filePath;
      } else if (stats.isDirectory()) {
        const foundPath = await findFilePath(filePath, targetEnding);
        if (foundPath) {
          return foundPath;
        }
      }
    }
    return null;
  } catch (error) {
    console.error(`Error in findFilePath: ${error as Error}`);
    return null;
  }
};

const checkIfFolderExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

const checkIfFileExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isFile();
  } catch (error) {
    return false;
  }
};

function renameIfExists(filePath: string): void {
  // Check if the file exists
  const exists = fs.existsSync(filePath);
  // File exists, rename it
  if (!exists) return;
  const { dir, name, ext } = parse(filePath);
  const oldFileName = `${name}_old${ext}`;
  const newPath = join(dir, oldFileName);

  fs.rename(filePath, newPath, (err) => {
    if (err) {
      return;
    }
  });
}

export { renameIfExists, findFilePath, checkIfFolderExists, checkIfFileExists };
