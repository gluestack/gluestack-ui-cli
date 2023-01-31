const fs = require('fs-extra');
const { execSync, exec } = require('child_process');
const prompts = require('prompts');
const process = require('process');

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

const removeClonedRepo = () => {
  const sourcePath = `${homedir}/.gluestackio/ui`;

  return new Promise((resolve, reject) => {
    exec(
      `cd ${sourcePath} && rm -rf gluestack-ui-components`,
      (error, stdout, stderr) => {
        if (error) {
          console.warn(error);
        }
        resolve(stdout ? stdout : stderr);
      }
    );
  });
};

const copyFolders = async (sourcePath, targetPath) => {
  const allComponentTypes = [];
  const allComponents = {};
  fs.readdirSync(sourcePath).forEach((directory) => {
    if (directory !== 'index.ts') {
      allComponentTypes.push({
        title: directory,
        value: directory,
      });
      allComponents[directory] = allComponents[directory] || [];
      fs.readdirSync(`${sourcePath}/${directory}`).forEach((subdirectory) => {
        if (subdirectory !== 'index.ts') {
          allComponents[directory].push({
            title: subdirectory,
            value: subdirectory,
          });
        }
      });
    }
  });

  const selectedComponentType = await prompts({
    type: 'multiselect',
    name: 'componentType',
    message: `Select the type of components:`,
    choices: [...allComponentTypes, { title: 'none', value: 'none' }],
  });
  const selectedComponents = {};

  await Promise.all(
    selectedComponentType.componentType.map(async (component) => {
      if (allComponents[component].length !== 0) {
        const selectComponents = await prompts({
          type: 'multiselect',
          name: 'components',
          message: `Select ${component} components:`,
          choices: allComponents[component],
        });
        selectedComponents[component] = selectComponents.components;
      } else {
        console.log(`No components of ${component} type!`);
      }
    })
  );

  await Promise.all(
    Object.keys(selectedComponents).map((component) => {
      createFolders(`${targetPath}/${component}`);
      selectedComponents[component].map((subcomponent) => {
        createFolders(`${targetPath}/${component}/${subcomponent}`);
        fs.copy(
          `${sourcePath}/${component}/${subcomponent}`,
          `${targetPath}/${component}/${subcomponent}`
        )
          .then(() => {
            console.log(`${subcomponent} copied!`);
          })
          .catch((err) => {
            console.error(err);
          });
      });
    })
  );
  removeClonedRepo();
};

const cloneComponentRepo = (folderPath) => {
  const cloneLocation = homedir + '/.gluestackio/ui';
  createFolders(cloneLocation);
  execSync(
    `cd ${cloneLocation} && git clone git@github.com:gluestack/components.git gluestack-ui-components`,
    {
      stdio: [0, 1, 2],
      cwd: folderPath,
    }
  );
};

const componentAdder = async () => {
  try {
    const folderPath = process.cwd();
    const config = require(`${folderPath}/gluestack-ui.config.js`);
    cloneComponentRepo(folderPath);
    createFolders(`${folderPath}/${config.componentsPath}`);
    const sourcePath = `${homedir}/.gluestackio/ui/gluestack-ui-components/src`;
    const targetPath = `${folderPath}/${config.componentsPath}`;
    copyFolders(sourcePath, targetPath);
  } catch (err) {
    console.log('Error: gluestack-ui is not initialised!');
  }
};

module.exports = { componentAdder };
