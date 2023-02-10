const fs = require('fs');
const path = require('path');
var spawn = require('child_process').spawn;

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
  if (projectType === 'Next') {
    packageJson.devDependencies['next-compose-plugins'] = '^2.2.1';
    packageJson.devDependencies['next-transpile-modules'] = '^10.0.0';
  }

  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
};

const yarnInstall = async () => {
  var ls = spawn('yarn');

  ls.stdout.on('data', function (data) {
    console.log('stdout: ' + data.toString());
  });

  ls.stderr.on('data', function (data) {
    console.log('stderr: ' + data.toString());
  });

  ls.on('exit', function (code) {
    console.log('child process exited with code ' + code.toString());
  });
};

module.exports = {
  addDependencies,
  yarnInstall,
};
