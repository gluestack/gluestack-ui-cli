import path from 'path';
import fs from 'fs';
import { getDataFiles } from './data';
import { isCancel, cancel, confirm, log } from '@clack/prompts';
import { isFollowingSrcDir } from '../utils';

const currentDirectory = process.cwd();

const getDocumentExtension = (): string => {
  const tsConfigPath = path.resolve(currentDirectory, 'tsconfig.json');
  return fs.existsSync(tsConfigPath) ? 'tsx' : 'jsx';
};

const updateDocument = async (
  document: string,
  fileName: string,
  isFollowingSrcDirFlag: boolean
): Promise<void> => {
  const documentExt = getDocumentExtension();
  const appDirectory = isFollowingSrcDirFlag
    ? path.join('src', 'pages')
    : 'pages';
  const documentPath = path.join(appDirectory, `${fileName}.${documentExt}`);

  try {
    const fullPath = path.resolve(currentDirectory, documentPath);
    fs.writeFileSync(fullPath, document, 'utf8');
    log.step(`- \x1b[32m${documentPath}\x1b[0m file is updated successfully!`);
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const updateNextConfig = async (nextConfig: string): Promise<void> => {
  const documentPath = path.resolve(currentDirectory, 'next.config.js');
  try {
    fs.writeFileSync(documentPath, nextConfig, 'utf8');
    log.step(
      '- ' + '\x1b[32mnext.config.js\x1b[0m' + ' file is updated successfully!'
    );
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

function convertToValidString(input: string): string {
  // Replace all occurrences of backslashes with forward slashes
  const output = input.replace(/\\/g, "/");
  return output;
}


const replaceFiles = async (folderName: string): Promise<void> => {
  const isFollowingSrcDirFlag = isFollowingSrcDir();
  const appDirectory = isFollowingSrcDirFlag
  ? path.join('src', 'pages')
  : 'pages';
  const gluestackConfigImportPath = convertToValidString(path.relative(appDirectory, currentDirectory));

  const { document, nextConfig, app } = getDataFiles(folderName, gluestackConfigImportPath);
  await updateDocument(document, '_document', isFollowingSrcDirFlag);
  await updateDocument(app, '_app', isFollowingSrcDirFlag);
  await updateNextConfig(nextConfig);
};

const autoSetup = async (folderName: string): Promise<any> => {
  try {
    log.info(
      "Hey there! It looks like we've stumbled upon a \x1b[34mNext.js project\x1b[0m! Would you like to take the express lane and proceed with the automatic setup?"
    );
    log.warning(
      `👉 Keep in mind that we'll be shaking things up a bit and overwriting a few files, namely

-  next.config.ts
-  _app.tsx
-  _document.tsx

So, it's advisable to save your current changes by committing them before proceeding.`
    );

    const shouldContinue = await confirm({
      message: `Would you like to proceed with the automatic setup?`,
    });

    if (isCancel(shouldContinue)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    if (shouldContinue) {
      log.warning('\x1b[33mOverwriting files...\x1b[0m');
      await replaceFiles(folderName);
    } else {
      log.warning(`\x1b[33mExiting without overwriting the files...\x1b[0m`);
      log.step(
        `Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`
      );
    }

    return shouldContinue;
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return '';
  }
};

export { autoSetup };
