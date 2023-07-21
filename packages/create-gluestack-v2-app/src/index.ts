#!/usr/bin/env node
const args = process.argv.slice(2);

let supportedArgs = ['--use-npm', '--help', '-h'];
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
import prettier from 'prettier';
import { select } from '@clack/prompts';
import { spawnSync } from 'child_process';
import { installDependencies, getArgsData } from '@gluestack/cli-utils';

async function updatePackageJson(projectName: any) {
  let packageJson = JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), projectName, 'package.json'),
      'utf-8'
    )
  );
  packageJson.name = projectName;

  const finalPackageJson = await prettier.format(JSON.stringify(packageJson), {
    semi: false,
    parser: 'json-stringify',
  });
  fs.writeFileSync(
    path.join(process.cwd(), projectName, 'package.json'),
    // JSON.stringify(packageJson)
    finalPackageJson
  );
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
      // validate(value) {
      //   if (value.length === 0) return `Value is required!`;
      // },
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
  log.info(` Using \x1b[33m npm install \x1b!`);
  updatePackageJson(projectName);

  installDependencies(
    projectName,
    // @ts-ignore
    'npm install'
  );
}

main();
