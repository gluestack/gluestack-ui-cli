const { execSync } = require('child_process');
const fs = require('fs-extra');
const prompts = require('prompts');

const packagesDir = './packages';
const promptsDir = 'prompts'; // Directory to store prompts data

async function selectPackage() {
  const packageDirs = await fs.readdir(packagesDir);
  const response = await prompts({
    type: 'select',
    name: 'selectedPackage',
    message: 'Select the package to release:',
    choices: packageDirs.map((dir) => ({ title: dir, value: dir })),
  });

  return response.selectedPackage;
}

async function getVersionBumpType() {
  const response = await prompts({
    type: 'select',
    name: 'bumpType',
    message: 'Choose version bump type:',
    choices: [
      { title: 'Major', value: 'major' },
      { title: 'Minor', value: 'minor' },
      { title: 'Patch', value: 'patch' },
      { title: 'Alpha', value: 'alpha' },
    ],
  });

  return response.bumpType;
}

async function getChangelogEntry() {
  const response = await prompts({
    type: 'text',
    name: 'changelogEntry',
    message: 'Enter changelog entry:',
  });

  return response.changelogEntry.trim();
}

function updatePackageJsonVersion(newVersion, packageDir) {
  const packageJsonPath = `${packagesDir}/${packageDir}/package.json`;
  const packageJson = fs.readJsonSync(packageJsonPath);
  packageJson.version = newVersion;
  fs.writeJsonSync(packageJsonPath, packageJson, { spaces: 2 });
}

function updateChangelog(changelogEntry, packageDir) {
  const changelogPath = `${packagesDir}/${packageDir}/changelog.MD`;
  fs.appendFileSync(changelogPath, `\n## ${changelogEntry}\n`);
}

(async () => {
  try {
    const selectedPackage = await selectPackage();
    const packageDir = `${packagesDir}/${selectedPackage}`;

    const bumpType = await getVersionBumpType();
    let newVersion;

    if (bumpType === 'alpha') {
      const response = await prompts({
        type: 'text',
        name: 'alphaVersion',
        message: 'Enter alpha version (e.g., 1.2.3-alpha.1):',
      });
      newVersion = response.alphaVersion.trim();
    } else {
      const currentVersion = fs.readJsonSync(
        `${packageDir}/package.json`
      ).version;
      const versionParts = currentVersion.split('.');
      const [major, minor, patch] = versionParts.map(Number);

      switch (bumpType) {
        case 'major':
          newVersion = `${major + 1}.0.0`;
          break;
        case 'minor':
          newVersion = `${major}.${minor + 1}.0`;
          break;
        case 'patch':
          newVersion = `${major}.${minor}.${patch + 1}`;
          break;
      }
    }

    const changelogEntry = await getChangelogEntry();
    updatePackageJsonVersion(newVersion, selectedPackage);
    updateChangelog(changelogEntry, selectedPackage);

    execSync(`git add ${packageJsonPath} ${changelogPath}`, {
      stdio: 'inherit',
      cwd: packageDir,
    });
    execSync(`git commit -m "Bump version to ${newVersion}"`, {
      stdio: 'inherit',
      cwd: packageDir,
    });
    console.log(
      `Version bumped to ${newVersion} with changelog entry added for package ${selectedPackage}.`
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
