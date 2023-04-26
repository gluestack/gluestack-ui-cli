const prompts = require('prompts');
const path = require('path');
const fs = require('fs');
const { getDataFiles } = require('./data');

const currentDirectory = process.cwd();

const updateDocument = async (document) => {
  const documentPath = path.resolve(`${currentDirectory}/pages/_document.tsx`);
  try {
    fs.writeFileSync(documentPath, document, 'utf8');
    console.log('- pages/_document file is updated successfully!');
  } catch (err) {
    console.error(err);
  }
};

const updateNextConfig = async (nextConfig) => {
  const documentPath = path.resolve(`${currentDirectory}/next.config.js`);
  try {
    fs.writeFileSync(documentPath, nextConfig, 'utf8');
    console.log('- next.config file is updated successfully!\n');
  } catch (err) {
    console.error(err);
  }
};

const updateApp = async (app) => {
  const documentPath = path.resolve(`${currentDirectory}/pages/_app.tsx`);
  try {
    fs.writeFileSync(documentPath, app, 'utf8');
    console.log('- pages/_app file is updated successfully!');
  } catch (err) {
    console.error(err);
  }
};

const replaceFiles = async (folderName) => {
  const { document, nextConfig, app } = getDataFiles(folderName);
  await updateDocument(document);
  await updateApp(app);
  await updateNextConfig(nextConfig);
};

const autoSetup = async (folderName) => {
  const proceedResponse = await prompts({
    type: 'text',
    name: 'proceed',
    message: `We detected that this is a Next.js project. Would you like to proceed with automatic setup? This is recommended for new projects.\nPlease note that the following files will be overwritten:\n- next.config.ts\n- _app.tsx\n- _document.tsx\n\nIt's recommended to commit your current changes before proceeding.\n\nTo proceed and overwrite the files, type 'y'. To cancel and exit, type 'n'.`,
    initial: 'y',
  });

  if (proceedResponse.proceed.toLowerCase() === 'y') {
    console.log('\nOverwriting files...');
    await replaceFiles(folderName);
  } else if (response.answer === 'n') {
    console.log('Exiting without overwriting the files...');
    console.log(
      `Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`
    );
  }

  return proceedResponse.proceed.toLowerCase();
};

module.exports = {
  autoSetup,
};
