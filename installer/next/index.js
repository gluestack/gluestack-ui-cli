// const prompts = require('prompts');
const { addDependencies } = require('../utils');
const { autoSetup } = require('./utils');
const { installDependencies } = require('../../component-adder/utils');
const currDir = process.cwd();

const nextInstaller = async (folderName) => {
  try {
    addDependencies('Next');
    const setupTypeAutomatic = await autoSetup(folderName);
    installDependencies(currDir);
    return setupTypeAutomatic;
  } catch (err) {}
};

module.exports = { nextInstaller };
