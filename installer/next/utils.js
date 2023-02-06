const fs = require('fs');
const path = require('path');
var spawn = require('child_process').spawn;

const currDir = process.cwd();

const addDependencies = async () => {
  const packageJsonPath = `${currDir}/package.json`;

  // Read in the existing package.json file
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Add a new dependency to the package.json file
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.dependencies['@dank-style/react'] = '^0.1.30';
  packageJson.dependencies['@universa11y/provider'] = '^0.1.5';
  packageJson.dependencies['@gluestack/ui-next-adapter'] = 'latest';

  // Add a new devDependency to the package.json file
  packageJson.devDependencies = packageJson.devDependencies || {};
  packageJson.devDependencies['react-native-web'] = '^0.18.12';
  packageJson.devDependencies['next-compose-plugins'] = '^2.2.1';
  packageJson.devDependencies['next-transpile-modules'] = '^10.0.0';

  // Write the updated package.json file
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log(`Added new dependency "new-dependency" to ${packageJsonPath}`);
};

const replaceNextConfig = async () => {
  const nextConfigPath = `${currDir}/next.config.js`;
  const newNextConfigPath = path.join(__dirname, `/nextConfigFile.js`);
  const newNextConfig = fs.readFileSync(newNextConfigPath, 'utf8');

  fs.writeFileSync(nextConfigPath, newNextConfig);
  console.log(`Next config File is updated successfully.`);
};

const addDocumentJs = async () => {
  const documentPath = `${currDir}/pages/_document.tsx`;

  const newDocumentPath = path.join(__dirname, `/documentFile.js`);

  const newDocument = fs.readFileSync(newDocumentPath, 'utf8');
  fs.writeFile(documentPath, newDocument, function (err) {
    if (err) throw err;
    console.log('Document File is created successfully.');
  });
};

const addUIConfigJs = async () => {
  const uiConfigPath = `${currDir}/dank-ui.config.js`;
  const newUIConfigPath = path.join(__dirname, `/uiConfigFile.js`);
  const newUIConfig = fs.readFileSync(newUIConfigPath, 'utf8');

  fs.writeFile(uiConfigPath, newUIConfig, function (err) {
    if (err) throw err;
    console.log('UI Config File is created successfully.');
  });
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

const deleteFolderRecursive = async (path) => {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file, index) {
      var curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
  console.log('Cleaned up auto-aliasing folder!');
};

module.exports = {
  addDependencies,
  replaceNextConfig,
  addDocumentJs,
  addUIConfigJs,
  yarnInstall,
  deleteFolderRecursive,
};
