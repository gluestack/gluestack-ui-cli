#!/usr/bin/env node
const args = process.argv.slice(2);

let supportedArgs = ['--use-npm', '--help', '-h'];
import path from 'path';
import fs from 'fs';
import {
  cancel,
  confirm,
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

const enableEslint = async (): Promise<any> => {
  const enableEslint = await confirm({
    message: 'Would you like to use ESLint?',
  });
  if (isCancel(enableEslint)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  return enableEslint;
};

function copyFolderSyncWithIgnore(
  source: string,
  destination: string,
  ignoreFiles?: Array<string>
) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }
  if (!ignoreFiles) ignoreFiles = [];

  const files = fs.readdirSync(source);

  for (const file of files) {
    if (ignoreFiles.includes(file)) {
      // Skip files listed in the ignoreFiles array
      continue;
    }

    const sourceFilePath = path.join(source, file);
    const destinationFilePath = path.join(destination, file);

    const stats = fs.statSync(sourceFilePath);

    if (stats.isDirectory()) {
      copyFolderSyncWithIgnore(
        sourceFilePath,
        destinationFilePath,
        ignoreFiles
      );
    } else {
      fs.copyFileSync(sourceFilePath, destinationFilePath);
    }
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
  const data = copyFolderSyncWithIgnore(
    projectPath,
    path.join(process.cwd(), projectName),
    []
  );
  log.info(` Using \x1b[33m npm install \x1b!`);
  updatePackageJson(projectName);

  installDependencies(
    projectName,
    // @ts-ignore
    'npm install'
  );
}

main();
