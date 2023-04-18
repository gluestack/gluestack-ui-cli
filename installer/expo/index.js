// const prompts = require('prompts');
const { addDependencies, installDependencies } = require("../utils");
const currDir = process.cwd();

const expoInstaller = async () => {
  try {
    addDependencies("Expo");
    // await installDependencies(currDir);
  } catch (err) {}
};

module.exports = { expoInstaller };
