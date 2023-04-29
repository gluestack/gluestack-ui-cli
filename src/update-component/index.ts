import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { componentAdder } from '../component-adder';

async function updateComponent(component: string): Promise<void> {
  try {
    const proceedResponse = await prompts({
      type: 'text',
      name: 'proceed',
      message:
        'Are you sure you want to update ' +
        component +
        ' ? This will remove all your existing changes and replace them with new (y/n) ',
      initial: 'n',
    });

    if (proceedResponse.proceed === 'y') {
      const configFile = fs.readFileSync(
        `${process.cwd()}/gluestack-ui.config.ts`,
        'utf-8'
      );

      const match = configFile.match(/componentPath:\s+'([^']+)'/);
      const componentPath = (match && match[1]) || '';
      const dirPath = path.resolve(
        process.cwd(),
        componentPath,
        'core',
        component
      );

      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
      } else {
        console.log(
          `\x1b[31mError: Component '${component}' not found.\x1b[0m`
        );
        return;
      }

      await componentAdder(component);
    } else {
      console.log(
        `\x1b[33mUpdate of the component '${component}' has been cancelled.\x1b[0m`
      );
    }
  } catch (err) {
    console.log(`\x1b[31mError: ${err}\x1b[0m`);
  }
}

export { updateComponent };
