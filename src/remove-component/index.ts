import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';
import { getConfigComponentPath } from '../component-adder/utils';

const currDir = process.cwd();

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

const addIndexFile = (componentsDirectory: string, level = 0) => {
  try {
    const files = fs.readdirSync(componentsDirectory);

    const exports = files
      .filter(
        file =>
          file !== 'index.js' && file !== 'index.tsx' && file !== 'index.ts'
      )
      .map(file => {
        return `export * from './${file.split('.')[0]}';`;
      })
      .join('\n');

    fs.writeFileSync(path.join(componentsDirectory, 'index.ts'), exports);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `Error: ${(error as Error).message}`);
  }
};

const updateIndexFile = async (dirPath: string, componentPath: string) => {
  const indexPath = path.resolve(dirPath, 'index.ts');
  fs.rmSync(indexPath);
  const targetPath = path.join(currDir, componentPath, 'core');
  addIndexFile(targetPath);
};

async function removeComponent(component = '') {
  try {
    const componentPath = getConfigComponentPath();

    const dirPath = path.resolve(currDir, componentPath, 'core');
    const componentsPath = path.resolve(
      currDir,
      componentPath,
      'core',
      component
    );

    if (component === '--all') {
      const requestedComponents = getAllComponents(dirPath);
      for (const component of requestedComponents) {
        const componentsPath = path.resolve(
          currDir,
          componentPath,
          'core',
          component
        );
        fs.rmSync(componentsPath, { recursive: true, force: true });
        console.log(
          ` \x1b[32m ✅  ${'\u001b[1m' +
            component +
            '\u001b[22m'} \x1b[0m component removed successfully!`
        );
      }
      //  Update index file
      await updateIndexFile(dirPath, componentPath);
    } else {
      const proceedResponse = await prompts({
        type: 'text',
        name: 'proceed',
        message: `Are you sure you want to remove ${component}?`,
        initial: 'y',
      });

      if (proceedResponse.proceed.toLowerCase() === 'y') {
        if (fs.existsSync(dirPath)) {
          fs.rmSync(componentsPath, { recursive: true, force: true });
          console.log(
            ` \x1b[32m ✅  ${'\u001b[1m' +
              component +
              '\u001b[22m'} \x1b[0m component removed successfully!`
          );

          //  Update index file
          await updateIndexFile(dirPath, componentPath);
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
