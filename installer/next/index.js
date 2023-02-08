const prompts = require('prompts');
const { addDependencies, yarnInstall } = require('./utils');

const nextInstaller = async () => {
  console.log(
    '\x1b[33m',
    `\nThis script will make changes in your folder to the following files:`,
    '\x1b[0m'
  );
  console.log('\x1b[32m', '- package.json (to add certain dependencies)');
  
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
