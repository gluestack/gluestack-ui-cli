const fs = require('fs');
const { execSync } = require('child_process');
require('dotenv').config();

const packagesDir = './packages';
const npmToken = process.env.NPM_TOKEN;

if (!npmToken) {
  console.error('Error: Missing npm_token.');
  process.exit(1);
}

function loginToNpm() {
  try {
    // Use the npm token to log in
    execSync(`echo //registry.npmjs.org/:_authToken=${npmToken} > ~/.npmrc`);
    console.log('Logged in to npm.');
  } catch (error) {
    console.error('Error logging in to npm:', error.message);
    process.exit(1);
  }
}

function getVersionFromPackageJson(packagePath) {
  try {
    const packageJsonContent = fs.readFileSync(
      `${packagePath}/package.json`,
      'utf8'
    );
    const packageJson = JSON.parse(packageJsonContent);
    const version = packageJson.version;

    return version;
  } catch (error) {
    console.error(
      `Error reading package.json in ${packagePath}:`,
      error.message
    );
    return null;
  }
}

function isVersionPublished(packageName, version) {
  try {
    execSync(`npm view ${packageName}@${version}`, { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

function publishWithAlphaTag(packagePath, version, packageName) {
  try {
    execSync('yarn && npm publish --tag alpha', {
      stdio: 'inherit',
      cwd: `${packagePath}`,
    });
    console.log('Package published successfully!');
    console.log('::set-output name=published::true'); // Output
    console.log(`::set-output name=packageName::${packageName}`); // Output
    console.log(`::set-output name=packageVersion::${version}`); // Output
  } catch (error) {
    console.error(
      `Error publishing with alpha tag in ${packagePath}:`,
      error.message
    );
    console.log('::set-output name=published::false'); // Output
  }
}

function publishWithLatestTag(packagePath, version, packageName) {
  try {
    execSync('npm publish --tag latest', {
      stdio: 'inherit',
      cwd: `${packagePath}`,
    });
    console.log('Package published successfully!');
    console.log('::set-output name=published::true'); // Output
    console.log(`::set-output name=packageName::${packageName}`); // Output
    console.log(`::set-output name=packageVersion::${version}`); // Output
  } catch (error) {
    console.error(
      `Error publishing with latest tag in ${packagePath}:`,
      error.message
    );
    console.log('::set-output name=published::false'); // Output
  }
}

function publishPackage(packagePath) {
  const version = getVersionFromPackageJson(packagePath);
  const packageName = require(`${packagePath}/package.json`).name;

  if (!version) {
    console.log(`Error: Version not found in package.json in ${packagePath}.`);
    return;
  }

  if (isVersionPublished(packageName, version)) {
    console.log(
      `Version ${version} of ${packageName} is already published on npm. Skipping publish.`
    );
    return;
  }

  if (version.includes('alpha')) {
    console.log(
      `Alpha version detected in ${packageName}. Publishing with "alpha" tag.`
    );
    publishWithAlphaTag(packagePath, version, packageName);
  } else {
    console.log(
      `Non-alpha version detected in ${packageName}. Publishing with "latest" tag.`
    );
    publishWithLatestTag(packagePath, version, packageName);
  }
}

function publishAllPackages() {
  try {
    // const packageDirs = fs.readdirSync(packagesDir);

    const packageDirs = [
      'create-next-app-with-gluestack-ui',
      'create-expo-app-with-gluestack-ui',
      'create-react-native-app-with-gluestack-ui',
      'utils',
    ];

    for (const packageDir of packageDirs) {
      const packagePath = `${packagesDir}/${packageDir}`;
      publishPackage(packagePath);
    }
  } catch (error) {
    console.error('Error reading packages directory:', error.message);
  }
}

// Log in to npm with the provided token
loginToNpm();

// Call the function to publish all packages
publishAllPackages();
