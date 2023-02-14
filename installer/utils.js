const fs = require('fs');
const path = require('path');
var spawn = require('child_process').spawn;
const Spinner = require('cli-spinner').Spinner;

const currDir = process.cwd();

const addDependencies = async (projectType) => {
  const packageJsonPath = `${currDir}/package.json`;

  // Read in the existing package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add a new dependency to the package.json file
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['@dank-style/react'] = 'latest';
  packageJson.dependencies['@universa11y/provider'] = 'latest';
  if (projectType === 'Next') {
    packageJson.dependencies['@gluestack/ui-next-adapter'] = 'latest';
  }

  // Add a new devDependency to the package.json file
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies['react-native-web'] = '^0.18.12';

  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

const installDependencies = async (currDir) => {
  const spinner = new Spinner('%s Installing dependencies... ');
  spinner.setSpinnerString('|/-\\');

  let ls = spawn('npm', ['install']);

  if (fs.existsSync(path.join(currDir, 'yarn.lock'))) {
    ls = spawn('yarn');
  }

  spinner.start();

  ls.on('exit', function (code) {
    spinner.stop();

    if (code === 0) {
      console.log('Dependencies installed successfully.');
    } else {
      console.error('Error installing dependencies.');
    }
  });
};

module.exports = {
  addDependencies,
  installDependencies,
};
