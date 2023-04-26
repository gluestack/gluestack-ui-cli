const fs = require('fs');
const path = require('path');
var spawn = require('child_process').spawn;
const Spinner = require('cli-spinner').Spinner;

const currDir = process.cwd();

const addDependencies = (projectType) => {
  const packageJsonPath = `${currDir}/package.json`;
  // Read in the existing package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add a new dependency to the package.json file
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['@dank-style/react'] = 'latest';
  packageJson.dependencies['@gluestack-ui/provider'] = 'latest';
  packageJson.dependencies['@dank-style/animation-plugin'] = 'latest';
  if (projectType === 'Next') {
    packageJson.dependencies['@gluestack/ui-next-adapter'] = 'latest';
  }

  // Add a new devDependency to the package.json file
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies['react-native-web'] = '^0.18.12';
  packageJson.devDependencies['react-native'] = '^0.70.7';

  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

module.exports = {
  addDependencies,
};
