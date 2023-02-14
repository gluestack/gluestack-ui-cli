// const prompts = require('prompts');
const { addDependencies, installDependencies } = require('../utils');
const currDir = process.cwd();

const expoInstaller = async () => {
  await addDependencies('Expo');
  await installDependencies(currDir);
};

module.exports = { expoInstaller };
