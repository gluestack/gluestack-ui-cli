const fs = require('fs');

const initChecker = async () => {
  let gluestackConfigPresent = false;
  fs.readdirSync('../').forEach((directory) => {
    if (directory === 'gluestack.config.js') {
      gluestackConfigPresent = true;
    }
  });
  if (!gluestackConfigPresent) {
    console.log('gluestack.config.js is not present.');
  } else {
    console.log('gluestack.config.js is already present.');
  }
};

module.exports = { initChecker };
