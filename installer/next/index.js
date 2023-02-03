const prompts = require('prompts');
const {
  addDependencies,
  replaceNextConfig,
  addDocumentJs,
  addUIConfigJs,
  yarnInstall,
} = require('./utils');

const nextInstaller = async () => {
  console.log(
    '\x1b[33m',
    `\nThis script will make changes in your folder to the following files:`,
    '\x1b[0m'
  );
  console.log('\x1b[32m', '- package.json (to add certain dependencies)');
  // console.log(' - next.config.js (to add Next.js configuration)');
  // console.log(' - ui.config.ts (to add ui config)');
  // console.log(
  //   ' - pages/_document.tsx (to add custom document for Next.js)',
  //   '\x1b[0m'
  // );
  console.log(
    '\x1b[31m',
    '\nPlease note that if these files already exist, they will be replaced.\n',
    '\x1b[0m'
  );

  const proceedResponse = await prompts({
    type: 'text',
    name: 'proceed',
    message: 'Do you wish to continue? (y/n) ',
  });

  if (proceedResponse.proceed.toLowerCase() === 'y') {
    console.log(
      '\x1b[32m',
      '\nMaking changes to the specified files...',
      '\x1b[0m'
    );
    await addDependencies();
    // await replaceNextConfig();
    // await addDocumentJs();
    // await addUIConfigJs();
    await yarnInstall();
  } else if (proceedResponse.proceed.toLowerCase() === 'n') {
    console.log('\nExiting script.');
  } else {
    console.log(
      '\x1b[31m',
      "\nInvalid Input, please type 'yes' or 'no' to continue or exit the script.",
      '\x1b[0m'
    );
  }
};

module.exports = { nextInstaller };
