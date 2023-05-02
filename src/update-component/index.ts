import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { componentAdder } from '../component-adder';

const pascalToDash = (str: string): string => {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

const getAllComponents = (source: string): string[] => {
  const requestedComponents: string[] = [];

  fs.readdirSync(source).forEach((component: string) => {
    if (
      !(
        component === 'index.ts' ||
        component === 'index.tsx' ||
        component === 'GluestackUIProvider' ||
        component === 'styled'
      )
    ) {
      const cliComponent = pascalToDash(component);
      requestedComponents.push(cliComponent);
    }
  });

  return requestedComponents;
};

async function updateComponent(component = ''): Promise<void> {
  try {
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

    if (component === '--all') {
      const source = path.resolve(process.cwd(), componentPath, 'core');
      const requestedComponents = getAllComponents(source);
      for (const component of requestedComponents) {
        await componentAdder(component, false, true);
      }
    } else {
      const proceedResponse = await prompts({
        type: 'text',
        name: 'proceed',
        message: `Are you sure you want to update ${component} ? This will remove all your existing changes and replace them with new (y/n)`,
        initial: 'y',
      });

      if (proceedResponse.proceed === 'y') {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        } else {
          console.log(
            `\x1b[31mError: Component '${component}' not found.\x1b[0m`
          );
          return;
        }
        await componentAdder(component, false, true);
      } else {
        console.log(
          `\x1b[33mUpdate of the component '${component}' has been cancelled.\x1b[0m`
        );
      }
    }
  } catch (err) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      'Error updating components:',
      (err as Error).message
    );
  }
}

export { updateComponent };
