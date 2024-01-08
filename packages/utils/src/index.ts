#!/usr/bin/env node

let supportedArgs = ['--use-npm', '--use-yarn', '--help', '-h', '--use-pnpm'];
import path from 'path';
import { log, spinner } from '@clack/prompts';
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
    spawnSync(`git init && ${installationMethod} && rm .npmignore`, {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true,
    });

    s.stop(`\x1b[32mDependencies have been installed successfully.\x1b[0m`);
  } catch (err) {
    log.error(`\x1b[31mError: ${err}\x1b[0m`);
    log.error('\x1b[31mError installing dependencies:\x1b[0m');
    log.warning(` - Run \x1b[33m yarn \x1b[0m manually!`);
    throw new Error('Error installing dependencies.');
  }
}

function getArgsData(args: any, customSupportedArgs?: Array<any>) {
  let projectName: string = '';
  let installationMethod = '';
  // 'npm install --legacy-peer-deps';
  if (args.length > 0) {
    if (!(args[0].startsWith('-') || args[0].startsWith('--'))) {
      if (typeof args[0] === 'string') {
        projectName = args[0];
      }
    }
  }

  if (customSupportedArgs) {
    supportedArgs = customSupportedArgs;
  }

  for (let i = projectName !== '' ? 1 : 0; i < args.length; i++) {
    if (supportedArgs.includes(args[i])) {
      if (args[i] === '--help' || args[i] === '-h') {
        console.log(
          `
              Usage: create-next-app-with-gluestack-ui [project-name] [options]

              Options:
                -h, --help          output usage information
                --use-npm           use npm to install dependencies
                --use-yarn          use yarn to install dependencies
                --use-pnpm          use pnpm to install dependencies
              `
        );
        process.exit(0);
      } else if (args[i] === '--use-npm' || args[i] === 'use-npm') {
        installationMethod = 'npm install --legacy-peer-deps';
      } else if (args[i] === '--use-yarn' || args[i] === 'use-yarn') {
        installationMethod = 'yarn';
      } else if (args[i] === '--use-pnpm' || args[i] === 'use-pnpm') {
        installationMethod = 'pnpm i --lockfile-only';
      }
    } else {
      if (!(args[i].startsWith('-') || args[i].startsWith('--'))) {
        log.warning(`Please pass project name as first argument.`);
      }
      log.warning(
        `Unsupported argument: ${args[i]}. For more information run npm create gluestack --help`
      );
      process.exit(0);
    }
  }
  return { installationMethod, projectName };
}
export { installDependencies, getArgsData };
