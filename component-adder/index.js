const fs = require('fs-extra');
const { exec } = require('child_process');
const prompts = require('prompts');
const process = require('process');
const git = require('simple-git')();

const homeDir = require('os').homedir();
const currDir = process.cwd();

const createFolders = (pathx) => {
  const parts = pathx.split('/');
  let currentPath = '';

  parts.forEach((part) => {
    currentPath += part + '/';
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
  });
};

const removeClonedRepo = async (sourcePath) => {
  await exec(`cd ${sourcePath} && rm -rf ui`, (error, stdout, stderr) => {
    if (error) {
      console.warn(error);
    }
  });
};

const copyFolders = async (sourcePath, targetPath) => {
  const allComponents = [];
  const groupedComponents = {};

  fs.readdirSync(sourcePath).forEach((directory) => {
    if (directory !== 'index.ts') {
      allComponents.push({
        title: directory,
        value: directory,
      });
    }
  });

  const selectComponents = await prompts({
    type: 'multiselect',
    name: 'components',
    message: `Select components:`,
    choices: allComponents,
  });

  const selectedComponents = selectComponents.components;

  await Promise.all(
    selectedComponents.map((component) => {
      createFolders(`${targetPath}/${component}/`);
      fs.copy(`${sourcePath}/${component}/src`, `${targetPath}/${component}`)
        .then(() => {
          console.log(`${component} copied!`);
        })
        .catch((err) => {
          console.error(err);
        });
    })
  );

  await removeClonedRepo(`${homeDir}/.gluestack/cache`);
};

const cloneComponentRepo = async (targetpath, gitURL) => {
  const callback = () => {
    console.log('DONE!');
  };

  await removeClonedRepo(`${homeDir}/.gluestack/cache`);

  await git
    .outputHandler((command, stdout, stderr) => {
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);

      stdout.on('data', (data) => {
        console.log(data.toString('utf8'));
      });
    })
    .clone(gitURL, targetpath, [], callback);
};

const componentAdder = async () => {
  try {
    // Get config
    const config = require(`${currDir}/gluestack-ui.config.js`);

    // Clone repo locally in users home directory
    const cloneLocation = homeDir + '/.gluestack/cache';
    const clonedpath = cloneLocation + '/ui';
    createFolders(cloneLocation);
    await cloneComponentRepo(clonedpath, 'git@github.com:gluestack/ui.git');

    // Copy requested components to the users project
    createFolders(`${currDir}/${config.componentsPath}`);
    const sourcePath = `${homeDir}/.gluestack/cache/ui/packages`;
    const targetPath = `${currDir}/${config.componentsPath}`;
    await copyFolders(sourcePath, targetPath);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { componentAdder };
