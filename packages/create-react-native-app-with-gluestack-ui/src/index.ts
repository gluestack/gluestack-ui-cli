#!/usr/bin/env node

const args = process.argv.slice(2);
let supportedArgs = ['--use-npm', '--use-yarn', '--help', '-h', '--use-pnpm'];
import path from 'path';
import fs from 'fs';
import {
  cancel,
  isCancel,
  log,
  multiselect,
  spinner,
  text,
} from '@clack/prompts';
import { select } from '@clack/prompts';
import { spawnSync } from 'child_process';
import { installDependencies, getArgsData } from '@gluestack/cli-utils';

async function main() {
  let argsInfo = await getArgsData(args);

  let projectName: any = argsInfo?.projectName;
  let installationMethod: any = argsInfo?.installationMethod;
  let projectPath = path.join(
    path.resolve(__dirname, '..'),
    'src',
    'page-router'
  );
  if (projectName === '' || projectName == undefined) {
    projectName = await text({
      message: 'What is the name of your application?',
      placeholder: 'my-app',
      defaultValue: 'my-app',
      // validate(value) {
      //   if (value.length === 0) return `Value is required!`;
      // },
    });
    if (isCancel(projectName)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
  }
  const useAppRouter = await select({
    message: 'Would you like to use App Router?',
    options: [
      {
        value: 'yes',
        label: 'yes',
        hint: 'Next versions 13.4 and React server components support (recommended)',
      },
      {
        value: 'no',
        label: 'no',
        hint: 'Next js page routing',
      },
    ],
  });
  if (isCancel(useAppRouter)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  if (useAppRouter === 'yes') {
    projectPath = path.join(path.resolve(__dirname, '..'), 'src', 'app-router');
  }

  // copy directory
  const data = fs.cpSync(projectPath, path.join(process.cwd(), projectName), {
    recursive: true,
  });
  log.info(
    ` Using \x1b[33m ${
      installationMethod == undefined ? 'npm install' : installDependencies
    } \x1b!`
  );

  installDependencies(
    projectName,
    // @ts-ignore
    installationMethod == undefined ? 'npm install' : installDependencies
  );
}

main();