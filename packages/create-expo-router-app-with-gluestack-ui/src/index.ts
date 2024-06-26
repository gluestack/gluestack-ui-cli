#!/usr/bin/env node
const args = process.argv.slice(2);

let supportedArgs = [
  '--use-npm',
  '--use-yarn',
  '--help',
  '-h',
  '--use-pnpm',
  '--use-bun',
];

import { cancel, isCancel, log, text } from '@clack/prompts';
import { getArgsData, installDependencies } from '@gluestack/cli-utils';
import fs from 'fs';
import path from 'path';

async function main() {
  let projectPath = path.join(path.resolve(__dirname, '..'), 'src', 'template');
  let argsInfo = getArgsData(args);

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
