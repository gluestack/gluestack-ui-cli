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
  const groupedComponents = {};

  fs.readdirSync(sourcePath).forEach((component) => {
    if (component !== 'index.ts') {
      // Read in the existing package.json file
      const packageJsonPath = `${sourcePath}/${component}/package.json`;
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      let componentType;
      if (packageJson.keywords.indexOf('components') !== -1) {
        componentType = packageJson.keywords[1];
      }

      groupedComponents[componentType] = groupedComponents[componentType] || [];
      groupedComponents[componentType].push(component);
    }
  });

  const selectedComponentType = await prompts({
    type: 'multiselect',
    name: 'componentType',
    message: `Select the type of components:`,
    choices: Object.keys(groupedComponents).map((type) => {
      return { title: type, value: type };
    }),
  });

  const selectedComponents = {};

  await Promise.all(
    selectedComponentType.componentType.map(async (component) => {
      if (groupedComponents[component].length !== 0) {
        const selectComponents = await prompts({
          type: 'multiselect',
          name: 'components',
          message: `Select ${component} components:`,
          choices: groupedComponents[component].map((type) => {
            return { title: type, value: type };
          }),
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
          `${sourcePath}/${subcomponent}/src`,
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

  // await removeClonedRepo(`${homeDir}/.gluestack/cache`);
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
    // const cloneLocation = homeDir + '/.gluestack/cache';
    // const clonedpath = cloneLocation + '/ui';
    // createFolders(cloneLocation);
    // await cloneComponentRepo(clonedpath, 'git@github.com:gluestack/ui.git');

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
