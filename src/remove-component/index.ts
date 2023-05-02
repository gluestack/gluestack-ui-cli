import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

const currDir = process.cwd();

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
      // const cliComponent = pascalToDash(component);
      requestedComponents.push(component);
    }
  });

  return requestedComponents;
};

async function removeComponent(component = '') {
  try {
    const configFile = fs.readFileSync(
      `${currDir}/gluestack-ui.config.ts`,
      'utf-8'
    );
    const match = configFile.match(/componentPath:\s+'([^']+)'/);
    const componentPath = (match && match[1]) || '';
    const dirPath = path.resolve(currDir, componentPath, 'core', component);

    if (component === '--all') {
      const source = path.resolve(process.cwd(), componentPath, 'core');
      const requestedComponents = getAllComponents(source);
      for (const component of requestedComponents) {
        const dirPath = path.resolve(currDir, componentPath, 'core', component);
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(
          ` \x1b[32m ✔  ${'\u001b[1m' +
            component +
            '\u001b[22m'} \x1b[0m component removed successfully!`
        );
      }
    } else {
      const proceedResponse = await prompts({
        type: 'text',
        name: 'proceed',
        message: `Are you sure you want to remove ${component}?`,
        initial: 'y',
      });

      if (proceedResponse.proceed.toLowerCase() === 'y') {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
          console.log(
            '\x1b[32m%s\x1b[0m',
            `Component "${component}" has been removed.`
          );
        } else {
          console.log(
            '\x1b[33m%s\x1b[0m',
            `Component "${component}" not found.`
          );
        }
      } else {
        console.log(
          '\x1b[31m%s\x1b[0m',
          `The removal of component "${component}" has been canceled.`
        );
      }
    }
  } catch (err) {
    console.error(`Error removing component: ${(err as Error).message}`);
  }
}

export { removeComponent };
