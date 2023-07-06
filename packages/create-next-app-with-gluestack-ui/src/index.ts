#!/usr/bin/env node

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

function installDependencies(projectName: string) {
  const projectPath = path.join(process.cwd(), projectName);
  // try {
  //   execSync(`cd ${projectPath} && yarn`);
  //   console.log('Yarn command executed successfully.');
  // } catch (error) {
  //   console.error(`Error executing yarn: ${error}`);
  // }

  const s = spinner();
  s.start('⏳ Installing dependencies...');

  try {
    spawnSync(
      `yarn && git init && touch .gitignore   
    echo "node_modules .next" >> .gitignore`,
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
    throw new Error('Error installing dependencies.');
  }
}

async function main() {
  let projectPath = path.join(
    path.resolve(__dirname, '..'),
    'src',
    'page-router'
  );

  const projectType = await select({
    message: 'Pick a project type.',
    options: [
      {
        value: 'app-router',
        label: 'nextjs app Router',
        hint: 'Next versions 13.4 and React server components support',
      },
      {
        value: 'page-router',
        label: 'nextjs page router',
        hint: 'Next js page routing',
      },
    ],
  });
  if (isCancel(projectType)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }
  if (projectType === 'app-router') {
    projectPath = path.join(path.resolve(__dirname, '..'), 'src', 'app-router');
  }

  const projectName = await text({
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
  // copy directory
  const data = fs.cpSync(projectPath, path.join(process.cwd(), projectName), {
    recursive: true,
  });

  installDependencies(projectName);
}

main();
