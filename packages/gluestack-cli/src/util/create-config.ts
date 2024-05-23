import * as fs from 'fs';
import * as path from 'path';
import { log, text } from '@clack/prompts';
import { config } from '../config';

const _currDir = process.cwd();

// Function to get existing component style
async function getExistingComponentStyle() {
  if (fs.existsSync(path.join(_currDir, config.UIconfigPath))) {
    const fileContent: string = fs.readFileSync(
      path.join(_currDir, config.UIconfigPath),
      'utf8'
    );
    // Define a regular expression pattern to match import statements
    const importPattern: RegExp = new RegExp(
      `import {\\s*\\w+\\s*} from ['"]nativewind['"]`,
      'g'
    );
    if (importPattern.test(fileContent)) {
      config.style = config.nativeWindRootPath;
      return config.nativeWindRootPath;
    } else {
      config.style = config.gluestackStyleRootPath;
      return config.gluestackStyleRootPath;
    }
  }
}

async function getComponentStyle() {
  try {
    if (
      fs.existsSync(path.join(_currDir, config.writableComponentsPath)) &&
      fs.existsSync(path.join(_currDir, config.UIconfigPath))
    )
      getExistingComponentStyle();
    if (
      fs.existsSync(path.join(_currDir, config.writableComponentsPath)) &&
      !fs.existsSync(path.join(_currDir, config.UIconfigPath))
    ) {
      const userInput = await text({
        message: `No file found as ${config.configFileName} in components folder, Enter path to your config file in your project, if exist:`,
        validate(value) {
          if (value.length === 0) return `please enter a valid path`;
        },
      });
      config.UIconfigPath = userInput.toString();
      config.configFileName = config.UIconfigPath.split('/').pop() as string;
      if (fs.existsSync(path.join(_currDir, config.UIconfigPath)))
        getExistingComponentStyle();
      else {
        log.error(`\x1b[31mInvalid config path provided\x1b[0m`);
        process.exit(1);
      }
    }
    if (!fs.existsSync(path.join(_currDir, config.writableComponentsPath))) {
      log.warning(
        `\x1b[33mgluestack is not initialized in the project. use 'npx gluestack-ui init' or 'help' to continue.\x1b[0m`
      );
      process.exit(1);
    }
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
}

export { getComponentStyle };
