#!/usr/bin/env node

const args = process.argv.slice(2);

let supportedArgs = ['--use-npm', '--use-yarn', '--help', '-h', '--use-pnpm'];

import path from 'path';
import fs from 'fs';
import { cancel, isCancel, log, text, spinner } from '@clack/prompts';
import { getArgsData } from '@gluestack/cli-utils';
import { spawnSync } from 'child_process';

function installDependencies(projectName: string, installationMethod: string) {
  const projectPath = path.join(process.cwd(), projectName);
  const s = spinner();
  s.start('⏳ Installing dependencies...');

  try {
    spawnSync(`mv gitignore .gitignore`, {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true,
    });
  } catch (err) {
    log.error(`\x1b[31mError: gitignore file not found in template!\x1b[0m`);
  }

  try {
    spawnSync(
      `git init && ${installationMethod} && rm .npmignore && cd ios && pod install`,
      {
        cwd: projectPath,
        stdio: 'inherit',
        shell: true,
      }
    );

    s.stop(`\x1b[32mDependencies have been installed successfully.\x1b[0m`);
  } catch (err) {
    log.error(`\x1b[31mError: ${err}\x1b[0m`);
    log.error('\x1b[31mError installing dependencies:\x1b[0m');
    log.warning(` - Run \x1b[33m yarn \x1b[0m manually!`);
    log.warning(` - Run \x1b[33m pod install \x1b[0m manually!`);
    throw new Error('Error installing dependencies.');
  }
}

async function main() {
  let projectPath = path.join(path.resolve(__dirname, '..'), 'src', 'template');
  let argsInfo = getArgsData(args, supportedArgs);
  let projectName: any = argsInfo?.projectName;
  let installationMethod: any = argsInfo?.installationMethod;
  if (projectName === '' || projectName == undefined) {
    projectName = await text({
      message: 'What is the name of your application?',
      placeholder: 'my-app',
      defaultValue: 'my-app',
    });
    if (isCancel(projectName)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  // copy directory
  const data = fs.cpSync(projectPath, path.join(process.cwd(), projectName), {
    recursive: true,
  });

  log.info(` Using \x1b[33m ${installationMethod} \x1b!`);
  installDependencies(projectName, installationMethod);
}

main();
