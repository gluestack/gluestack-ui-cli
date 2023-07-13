#! /usr/bin/env node
import minimist from 'minimist';
const args = process.argv.slice(2);

let supportedArgs = ['--use-npm', '--use-yarn', '--help', '-h', '--use-pnpm','--app','--page'];
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

function installDependencies(projectName: string, installationMethod: string) {
  const projectPath = path.join(process.cwd(), projectName);
  // try {
  //   execSync(`cd ${projectPath} && yarn`);
  //   console.log('Yarn command executed successfully.');
  // } catch (error) {
  //   console.error(`Error executing yarn: ${error}`);
  // }
  process.on('SIGINT', function () {
    cancel('Operation cancelled.');
    process.exit(0);
  });

  const s = spinner();
  s.start('⏳ Installing dependencies...');

  try {
    spawnSync(
      `git init && ${installationMethod} && touch .gitignore
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
  process.on('SIGINT', function () {
    cancel('Operation cancelled.');
    process.exit(0);
  });
  let projectName: any = '',
    installationMethod = 'npm install';
  let useAppRouter;
  if (args.length > 0) {
    if (!(args[0].startsWith('-') || args[0].startsWith('--'))) {
      if (typeof args[0] === 'string') {
        projectName = args[0];
      }
    }
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
      } else if (args[i] === '--use-npm') {
        installationMethod = 'npm install --legacy-peer-deps';
      } else if (args[i] === '--use-yarn') {
        installationMethod = 'yarn';
      } else if (args[i] === '--use-pnpm') {
        installationMethod = 'pnpm i --lockfile-only';
      } else if (args[i] === '--app') {
        useAppRouter = 'yes';
      } else if (args[i] === '--page') {
        useAppRouter = 'no';
      }
    } else {
      log.warning(
        `Unsupported argument: ${args[i]}. For more information run npx create-next-app-with-gluestack-ui --help`
      );
      if (!(args[i].startsWith('-') || args[i].startsWith('--'))) {
        log.warning(`Please pass project name as first argument.`);
      }
      process.exit(0);
    }
  }

  let projectPath = path.join(
    path.resolve(__dirname, '..'),
    'src',
    'page-router'
  );
  if (projectName === '') {
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

  if (!useAppRouter) {
    useAppRouter = await select({
      message: 'Would you like to use App Router?',
      options: [
        {
          value: 'no',
          label: 'no',
          hint: 'Next js page routing',
        },
        {
          value: 'yes',
          label: 'yes',
          hint: 'Next versions 13.4 and React server components support (Experimental)',
        },
      ],
    });
    if (isCancel(useAppRouter)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
  }
  
  if (useAppRouter === 'yes') {
    projectPath = path.join(path.resolve(__dirname, '..'), 'src', 'app-router');
  }

  // copy directory
  const data = fs.cpSync(projectPath, path.join(process.cwd(), projectName), {
    recursive: true,
  });
  log.info(` Using \x1b[33m ${installationMethod} \x1b!`);

  installDependencies(projectName, installationMethod);
}

main();
