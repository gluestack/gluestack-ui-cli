const fs = require('fs');

const initChecker = async () => {
  let gluestackUIConfigPresent = false;
  const folderPath = process.cwd();

  fs.readdirSync(folderPath).forEach((directory) => {
    if (directory === 'gluestack-ui.config.ts') {
      gluestackUIConfigPresent = true;
    }
  });
  return gluestackUIConfigPresent;
};

module.exports = { initChecker };
