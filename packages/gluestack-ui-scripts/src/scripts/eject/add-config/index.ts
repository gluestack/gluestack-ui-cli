import fs from 'fs-extra';
import path, { join } from 'path';
import os from 'os';
import { warn } from 'console';
import { log } from '@clack/prompts';
import util from 'util';
const copyAsync = util.promisify(fs.copy);
const homeDir = os.homedir();

const currDir = process.cwd();
const sourcePath = path.join(
  homeDir,
  '.gluestack',
  'cache',
  'gluestack-ui',
  'example',
  'storybook',
  'src',
  'ui-components'
);
export async function addGluestackConfig() {
  if (!fs.existsSync(join(currDir, 'gluestack-ui.config.ts'))) {
    warn('Adding config file in current directory.');
    await addConfig(sourcePath, currDir);
  }
}

const addConfig = async (sourcePath: string, configTargetPath: string) => {
  try {
    // Copy Gluestack UI config to root
    const gluestackConfig = await fs.readFile(
      path.resolve(sourcePath, '../', 'gluestack-ui.config.ts'),
      'utf8'
    );

    await fs.writeFile(
      path.join(configTargetPath, 'gluestack-ui.config.ts'),
      gluestackConfig
    );
  } catch (err) {
    log.error(JSON.stringify(err));
  }
};

// const initialSetup = async () => {
//   await addProvider(sourcePath, currDir);

//   addIndexFile(cu);
//   addDependencies();
// };

// const addProvider = async (sourcePath: string, targetPath: string) => {
//   try {
//     // Copy Provider and styled folder
//     await copyAsync(
//       path.join(sourcePath, 'Provider'),
//       path.join(targetPath, 'core', 'GluestackUIProvider')
//     );
//     await copyAsync(
//       path.join(sourcePath, 'styled'),
//       path.join(targetPath, 'core', 'styled')
//     );

//     fs.unlinkSync(
//       path.join(targetPath, 'core', 'GluestackUIProvider', 'config.json')
//     );
//     fs.unlinkSync(path.join(targetPath, 'core', 'styled', 'config.json'));
//   } catch (err) {
//     log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
//   }
// };
