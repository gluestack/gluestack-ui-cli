#! /usr/bin/env node
const args = process.argv.slice(2);

let supportedArgs = [
  '--use-npm',
  '--use-yarn',
  '--help',
  '-h',
  '--use-pnpm',
  '--use-bun',
  '--app',
  '--page',
];
import { cancel, isCancel, log, select, spinner, text } from '@clack/prompts';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

function installDependencies(projectName: string, installationMethod: string) {
  const projectPath = path.join(process.cwd(), projectName);

  process.on('SIGINT', function () {
    cancel('Operation cancelled.');
    process.exit(0);
  });

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
    s.stop(`\x1b[32mSuccess! Created ${projectName} at ${projectPath}\x1b[0m`);
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

  let projectName: any = '';
  let installationMethod = 'npm install --legacy-peer-deps';
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
                --use-bun           use bun to install dependencies
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
      } else if (args[i] === '--use-bun') {
        installationMethod = 'bun i';
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
      message: 'What is the \x1b[36m name \x1b[36m of your application?',
      placeholder: 'my-app',
      defaultValue: 'my-app',
    });
    if (isCancel(projectName)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }
  }

  if (!useAppRouter) {
    useAppRouter = await select({
      message: 'Would you like to use \x1b[36mApp Router?\x1b[36m',
      options: [
        {
          value: 'yes',
          label: 'Yes',
          hint: 'Next.js versions 13.4 and React server components support',
        },
        {
          value: 'no',
          label: 'No',
          hint: 'Next.js page routing',
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
