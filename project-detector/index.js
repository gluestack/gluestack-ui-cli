const fs = require('fs');
const path = require('path');

const projectDetector = async () => {
  const currDir = process.cwd();

  const projectFiles = fs.readdirSync(currDir);

  let appType = 'Unknown';

  if (projectFiles.includes('package.json')) {
    const packageJson = require(`${currDir}/package.json`);
    const dependencies = packageJson.dependencies || {};

    if (dependencies.hasOwnProperty('react')) {
      appType = 'React';

      if (dependencies.hasOwnProperty('expo')) {
        appType = 'Expo';
      } else if (dependencies.hasOwnProperty('next')) {
        appType = 'Next';
      }
    }
  }

  console.log(appType, ' App detected!');
  return appType;
};

module.exports = { projectDetector };
