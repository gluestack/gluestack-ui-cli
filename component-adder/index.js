const fs = require('fs-extra');
const { execSync, exec } = require('child_process');
const prompts = require('prompts');
const process = require('process');
const git = require('simple-git')();

const homedir = require('os').homedir();

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

const removeClonedRepo = async () => {
  const sourcePath = `${homedir}/.gluestackio/`;

  await exec(`cd ${sourcePath} && rm -rf ui`, (error, stdout, stderr) => {
    if (error) {
      console.warn(error);
    }
  });
};

const copyFolders = async (sourcePath, targetPath) => {
  const allComponents = [];
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
  await removeClonedRepo();
};

const cloneComponentRepo = async () => {
  const cloneLocation = homedir + '/.gluestackio';
  const clonedpath = cloneLocation + '/ui';
  createFolders(cloneLocation);
  const gitURL = 'git@github.com:gluestack/ui.git';
  const callback = () => {
    console.log('DONE!');
  };

  await removeClonedRepo();

  await git
    .outputHandler((command, stdout, stderr) => {
      stdout.pipe(process.stdout);
      stderr.pipe(process.stderr);

      stdout.on('data', (data) => {
        console.log(data.toString('utf8'));
      });
    })
    .clone(gitURL, clonedpath, [], callback);
};

const addIndexFile = (path) => {
  const presentComponents = [];
  fs.readdirSync(path).forEach((component) => {
    if (directory !== 'index.ts') {
      presentComponents.push(component);
    }
  });
};

const componentAdder = async () => {
  try {
    console.log('Testing Complete!');
    const folderPath = process.cwd();
    const config = require(`${folderPath}/gluestack-ui.config.js`);
    await cloneComponentRepo(folderPath);
    createFolders(`${folderPath}/${config.componentsPath}`);
    const sourcePath = `${homedir}/.gluestackio/ui/packages`;
    const targetPath = `${folderPath}/${config.componentsPath}`;
    await copyFolders(sourcePath, targetPath);
    addIndexFile(targetPath);
  } catch (err) {
    console.log(err);
  }
};

module.exports = { componentAdder };
