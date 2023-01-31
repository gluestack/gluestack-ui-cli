const fs = require('fs');
const path = require('path');
const prompts = require('prompts');

const initializer = async () => {
  let gluestackConfigPresent = false;
  fs.readdirSync('../').forEach((directory) => {
    if (directory === 'gluestack.config.js') {
      gluestackConfigPresent = true;
    }
  });
  if (!gluestackConfigPresent) {
    // Add gluestack.config.ts
    const configPath = path.resolve(`../gluestack.config.js`);

    const response = await prompts({
      type: 'text',
      name: 'folderPath',
      message: 'Enter folder name where you want to add your components',
    });

    const newConfig = `module.exports = {
      componentsPath: ['./${response.folderPath}'],
    };`;

    fs.writeFile(configPath, newConfig, function (err) {
      if (err) throw err;
      console.log('gluestack.config.js is created successfully.');
    });
  } else {
    console.log('gluestack.config.js is already present.');
  }
};

module.exports = { initializer };
