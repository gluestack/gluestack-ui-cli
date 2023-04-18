// const prompts = require('prompts');
const { addDependencies, installDependencies } = require("../utils");
const currDir = process.cwd();

const nextInstaller = async () => {
  try {
    await addDependencies("Next");
    installDependencies(currDir);
  } catch (err) {}
};

module.exports = { nextInstaller };
