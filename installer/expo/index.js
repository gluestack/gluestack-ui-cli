// const prompts = require('prompts');
const { addDependencies } = require('../utils');
const { installDependencies } = require('../../component-adder/utils');
const currDir = process.cwd();

const expoInstaller = async () => {
  try {
    addDependencies();
    await installDependencies(currDir);
  } catch (err) {}
};

module.exports = { expoInstaller };
