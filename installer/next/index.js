// const prompts = require('prompts');
const { addDependencies } = require("../utils");
const { installDependencies } = require("../../component-adder/utils");
const currDir = process.cwd();

const nextInstaller = async () => {
  try {
    addDependencies("Next");
    installDependencies(currDir);
  } catch (err) {}
};

module.exports = { nextInstaller };
