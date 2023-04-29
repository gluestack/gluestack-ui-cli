import * as fs from 'fs';

const initChecker = async (): Promise<boolean> => {
  try {
    const folderPath = process.cwd();
    const files = fs.readdirSync(folderPath);
    const gluestackUIConfigPresent = files.includes('gluestack-ui.config.ts');
    return gluestackUIConfigPresent;
  } catch (err) {
    console.log('\x1b[31m%s\x1b[0m', 'Error:', (err as Error).message);
    return false;
  }
};

export { initChecker };
