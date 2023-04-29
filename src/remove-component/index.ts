import fs from 'fs-extra';
import path from 'path';
import prompts from 'prompts';

const currDir = process.cwd();

async function removeComponent(component: string | null) {
  try {
    const proceedResponse = await prompts({
      type: 'text',
      name: 'proceed',
      message: `Are you sure you want to remove ${component}?`,
      initial: 'n',
    });

    if (proceedResponse.proceed.toLowerCase() === 'y') {
      const configFile = fs.readFileSync(
        `${currDir}/gluestack-ui.config.ts`,
        'utf-8'
      );
      const match = configFile.match(/componentPath:\s+'([^']+)'/);
      const componentPath = (match && match[1]) || '';
      const dirPath = path.resolve(
        currDir,
        componentPath,
        'core',
        component || ''
      );

      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`Component "${component}" has been removed.`);
      } else {
        console.log(`Component "${component}" not found.`);
      }
    } else {
      console.log(`Component "${component}" removal cancelled.`);
    }
  } catch (err) {
    console.error(`Error removing component: ${(err as Error).message}`);
  }
}

export { removeComponent };
