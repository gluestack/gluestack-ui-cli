import prompts from 'prompts';
import path from 'path';
import fs from 'fs';
import { getDataFiles } from './data';

const currentDirectory = process.cwd();

const getDocumentExtension = (): string => {
  const tsConfigPath = path.resolve(`${currentDirectory}/tsconfig.json`);
  return fs.existsSync(tsConfigPath) ? 'tsx' : 'jsx';
};

const updateDocument = async (document: string): Promise<void> => {
  const documentExt = getDocumentExtension();
  const documentPath = path.resolve(
    `${currentDirectory}/pages/_document.${documentExt}`
  );
  try {
    fs.writeFileSync(documentPath, document, 'utf8');
    console.log(
      '\x1b[32m',
      `- pages/_document.${documentExt} file is updated successfully!`
    );
  } catch (err) {
    console.error(
      '\x1b[31m',
      `Error updating pages/_document.${documentExt} file: ${
        (err as Error).message
      }`
    );
  }
};

const updateNextConfig = async (nextConfig: string): Promise<void> => {
  const documentPath = path.resolve(`${currentDirectory}/next.config.js`);
  try {
    fs.writeFileSync(documentPath, nextConfig, 'utf8');
    console.log('\x1b[32m', `- next.config.js file is updated successfully!`);
  } catch (err) {
    console.error(
      '\x1b[31m',
      `Error updating next.config.js file: ${(err as Error).message}`
    );
  }
};

const updateApp = async (app: string): Promise<void> => {
  const documentExt = getDocumentExtension();
  const documentPath = path.resolve(
    `${currentDirectory}/pages/_app.${documentExt}`
  );
  try {
    fs.writeFileSync(documentPath, app, 'utf8');
    console.log(
      '\x1b[32m',
      `- pages/_app.${documentExt} file is updated successfully!`
    );
  } catch (err) {
    console.error(
      '\x1b[31m',
      `Error updating pages/_app.${documentExt} file: ${(err as Error).message}`
    );
  }
};

const replaceFiles = async (folderName: string): Promise<void> => {
  const { document, nextConfig, app } = getDataFiles(folderName);
  await updateDocument(document);
  await updateApp(app);
  await updateNextConfig(nextConfig);
};

const autoSetup = async (folderName: string): Promise<string> => {
  try {
    const proceedResponse: any = await prompts({
      type: 'text',
      name: 'proceed',
      message: `We detected that this is a Next.js project. Would you like to proceed with automatic setup? This is recommended for new projects.\nPlease note that the following files will be overwritten:\n- next.config.ts\n- _app.tsx\n- _document.tsx\n\nIt's recommended to commit your current changes before proceeding.\n\nTo proceed and overwrite the files, type 'y'. To cancel and exit, type 'n'.`,
      initial: 'y',
    });

    if (proceedResponse.proceed.toLowerCase() === 'y') {
      console.log('\x1b[33m%s\x1b[0m', '\nOverwriting files...');
      await replaceFiles(folderName);
    } else if (proceedResponse.answer === 'n') {
      console.log(
        '\x1b[33m%s\x1b[0m',
        'Exiting without overwriting the files...'
      );
      console.log(
        `Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`
      );
    }

    return proceedResponse.proceed.toLowerCase();
  } catch (err) {
    console.error(
      '\x1b[31m%s\x1b[0m',
      `Error in autoSetup: ${(err as Error).message}`
    );
    return '';
  }
};

export { autoSetup };
