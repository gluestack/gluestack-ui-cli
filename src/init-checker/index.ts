import * as fs from 'fs';
import { log } from '@clack/prompts';

const initChecker = async (): Promise<boolean> => {
  try {
    const folderPath = process.cwd();
    const files = fs.readdirSync(folderPath);
    const gluestackUIConfigPresent = files.includes('gluestack-ui.config.ts');
    return gluestackUIConfigPresent;
  } catch (err) {
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    return false;
  }
};

export { initChecker };
