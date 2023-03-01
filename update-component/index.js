const fs = require("fs-extra");
const currDir = process.cwd();
const path = require("path");
const { componentAdder } = require("../component-adder");

async function updateComponent(component = null) {
  try {
    const configFile = fs.readFileSync(
      `${currDir}/gluestack-ui.config.ts`,
      "utf-8"
    );

    const match = configFile.match(/componentPath:\s+'([^']+)'/);
    const componentPath = match && match[1];
    const dirPath = path.resolve(currDir, componentPath, "core", component);

    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
    await componentAdder(component);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  updateComponent,
};
