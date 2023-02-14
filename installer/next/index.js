// const prompts = require('prompts');
const { addDependencies, installDependencies } = require('../utils');
const currDir = process.cwd();

const nextInstaller = async () => {
  await addDependencies('Next');
  await installDependencies(currDir);
};

module.exports = { nextInstaller };
