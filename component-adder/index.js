const fs = require('fs-extra');
const path = require('path');
const { execSync, exec } = require('child_process');
const prompts = require('prompts');

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
  return new Promise((resolve, reject) => {
    exec('cd .. && rm -rf gluestack-ui-components', (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
      }
      resolve(stdout ? stdout : stderr);
    });
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
    Object.keys(selectedComponents).map((comp) => {
      // execSync(`mkdir ${comp}`, {
      //   stdio: [0, 1, 2],
      //   cwd: path.resolve(`${targetPath}`),
      // });
      createFolders(`${targetPath}`);

      selectedComponents[comp].map((component) => {
        // execSync(`mkdir ${component}`, {
        //   stdio: [0, 1, 2],
        //   cwd: path.resolve(`${targetPath}/${comp}`),
        // });
        createFolders(`${targetPath}/${comp}`);

        fs.copy(
          `${sourcePath}/${comp}/${component}`,
          `${targetPath}/${comp}/${component}`
        )
          .then(() => {
            console.log('Copy completed!');
          })
          .catch((err) => {
            console.error(err);
          });
      });
    })
  );
  removeClonedRepo();
};

const cloneComponentRepo = () => {
  execSync(
    'git clone git@github.com:gluestack/components.git gluestack-ui-components',
    {
      stdio: [0, 1, 2],
      cwd: path.resolve(__dirname, '../../'),
    }
  );
};

const componentAdder = async () => {
  try {
    const config = require('../../gluestack.config');
    cloneComponentRepo();
    createFolders(`../${config.componentsPath}`);
    const sourcePath = path.resolve('../gluestack-ui-components/src');
    const targetPath = path.resolve(`../${config.componentsPath}`);
    copyFolders(sourcePath, targetPath);
  } catch (err) {
    console.log('Error: gluestack-ui is not initialised!');
  }
};

module.exports = { componentAdder };
