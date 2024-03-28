#! /usr/bin/env node
const { execSync } = require('child_process');
const args = process.argv.slice(2);
console.log('args', args);
import templatesMap from '../template-map/data.js';

// const optionsType = Object.keys(options).map((key) => {
//   return {
//     value: key,
//     hint: options[key].hint,
//     label: options[key].label,
//   };
// });

// const supportedFrameworkArgs = Object.keys(options).map((key) => '--' + key);

// const supportedStyleArgs = Object.keys(styleOptions).map((key) => '--' + key);

// const supportedPackagemanagers = ['npm', 'yarn', 'pnpm', 'bun'];
// const supportedPackagemanagerArgs = supportedPackagemanagers.map(
//   (manager) => '--use-' + manager
// );

// const supportedDocumentationArgs = ['--help', '-h'];

// let supportedArgs = [
//   // frameworks
//   ...supportedFrameworkArgs,
//   // style options
//   ...supportedStyleArgs,
//   // package manager
//   ...supportedPackagemanagerArgs,
//   // documentation
//   ...supportedDocumentationArgs,
// ];

let selectedFramework = '';
let selectedRouter = '';
let selectedStyle = '';
let selectedPackageManager = '';
let projName = '';

// if (args.length > 0) {
//   if (args.some((arg) => supportedDocumentationArgs.includes(arg))) {
//     // trigger help commmand and exit.
//     displayHelp();
//     process.exit(0);
//   }
//   args.forEach((arg) => {
//     if (supportedFrameworkArgs.includes(arg)) {
//       selectedFramework = arg.slice(2);
//     } else if (supportedStyleArgs.includes(arg)) {
//       selectedStyle = arg.slice(2);
//     } else if (supportedPackagemanagerArgs.includes(arg)) {
//       selectedPackageManager = arg.slice(6);
//     }
//   });
// }

function displayHelp() {
  // console.log('Usage: create-gluestack [project-name] [options]');
  // console.log('Options:');
  // // framework options
  // Object.keys(options).forEach((option) => {
  //   console.log(`  --${option.padEnd(23)} ${options[option].label}`);
  // });
  // // styling options
  // Object.keys(styleOptions).forEach((option) => {
  //   console.log(`  --${option.padEnd(23)} ${styleOptions[option]}`);
  // });
  // // help options
  // supportedDocumentationArgs.forEach((option) => {
  //   console.log(`  ${option.padEnd(25)} show help`);
  // });
}

import path from 'path';
import fs from 'fs';
import { cancel, isCancel, log, spinner, text, select } from '@clack/prompts';
import { spawnSync } from 'child_process';

async function main() {
  process.on('SIGINT', function () {
    cancel('Operation cancelled.');
    process.exit(1);
  });
  let templateName = '';
  const { options } = templatesMap;
  if (selectedFramework === '') {
    const { question, options: optionsType } = options.framework.default;
    // @ts-ignore
    selectedFramework = await select({
      message: question,
      options: [...optionsType],
    });
    templateName = selectedFramework;
    if (selectedFramework !== 'react-native') {
      const { question, options: optionsType } =
        // @ts-ignore
        options.framework.Route[selectedFramework];
      // @ts-ignore
      selectedRouter = await select({
        message: question,
        options: [...optionsType],
      });
      templateName = selectedRouter;
    }
  }

  if (projName === '') {
    // @ts-ignore
    projName = await text({
      message: 'Enter the name of your project: ',
      placeholder: 'my-app',
      defaultValue: 'my-app',
    });
  }

  if (selectedStyle === '') {
    const { question, options: optionsType } = options.style.default;
    // @ts-ignore
    selectedStyle = await select({
      message: question,
      options: [...optionsType],
    });
    templateName = `${templateName}-${selectedStyle}`;
  }

  if (selectedPackageManager === '') {
    const userPackageManager = process.env.npm_config_user_agent;
    if (userPackageManager && userPackageManager.includes('bun')) {
      selectedPackageManager = 'bun';
    } else if (userPackageManager && userPackageManager.includes('pnpm')) {
      selectedPackageManager = 'pnpm';
    } else if (userPackageManager && userPackageManager.includes('yarn')) {
      selectedPackageManager = 'yarn';
    } else {
      selectedPackageManager = 'npm';
    }
  }

  const templateDir = templatesMap.map[templateName];

  // @ts-ignore
  await cloneProject(projName, templateDir);

  await installDependencies(projName, selectedPackageManager);
  console.log('done ...');
}

async function cloneProject(projectName: string, templateName: string) {
  const { gitRepo, tag } = templatesMap;
  const dirPath = path.join(process.cwd(), projectName);
  console.log('Cloning Project...');
  execSync(`mkdir ${projectName}`);
  execSync('git init', { cwd: dirPath });
  execSync(`git remote add origin ${gitRepo}`, { cwd: dirPath });
  execSync('git config core.sparseCheckout true', { cwd: dirPath });
  execSync(`echo "apps/template/${templateName}" > .git/info/sparse-checkout`, {
    cwd: dirPath,
  });
  execSync(`git pull origin ${tag}`, { cwd: dirPath });
  execSync(`mv apps/template/${templateName}/* ./`, { cwd: dirPath });
  execSync('rm -rf apps', { cwd: dirPath });
  execSync('rm -rf .git', { cwd: dirPath });
  execSync('git init', { cwd: dirPath });
  console.log('Project Cloned!');
}

async function installDependencies(
  projectName: string,
  selectedPackageManager: string
) {
  console.log('Installing Dependencies...');
  execSync(`${selectedPackageManager} install`, {
    cwd: path.join(process.cwd(), projectName),
  });
  console.log('Dependancies Installed!');
}

{
  // console.log(
  //   'Installing',
  //   selectedFramework.replace(/-/g, ' '),
  //   'app',
  //   selectedStyle.replace(/-/g, ' '),
  //   'with package manager',
  //   selectedPackageManager,
  //   '...'
  // );
  // switch (choice) {
  //   case 'next-with-gluestack-ui':
  //     spawnSync(
  //       `npx create-next-app-with-gluestack-ui@latest --use-${installationPackage} ${args.join(
  //         ' '
  //       )}`,
  //       {
  //         cwd: process.cwd(),
  //         stdio: 'inherit',
  //         shell: true,
  //       }
  //     );
  //     break;
  //   case 'expo-with-gluestack-ui':
  //     spawnSync(
  //       `npx create-expo-app-with-gluestack-ui@latest --use-${installationPackage} ${args.join(
  //         ' '
  //       )} `,
  //       {
  //         cwd: process.cwd(),
  //         stdio: 'inherit',
  //         shell: true,
  //       }
  //     );
  //     break;
  //   case 'expo-router-v3-with-gluestack-ui':
  //     spawnSync(
  //       `npx create-expo-router-v3-app-with-gluestack-ui@latest --use-${installationPackage} ${args.join(
  //         ' '
  //       )} `,
  //       {
  //         cwd: process.cwd(),
  //         stdio: 'inherit',
  //         shell: true,
  //       }
  //     );
  //     break;
  //   case 'react-native-with-gluestack-ui':
  //     spawnSync(
  //       `npx create-react-native-app-with-gluestack-ui@latest --use-${installationPackage} ${args.join(
  //         ' '
  //       )}`,
  //       {
  //         cwd: process.cwd(),
  //         stdio: 'inherit',
  //         shell: true,
  //       }
  //     );
  //     break;
  //   default:
  //     log.info(` That option is coming soon! \x1b[33m Stay tuned!\x1b!`);
  //     break;
}

/*function installDependencies(projectName: string, installationMethod: string) {
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
          value: 'no',
          label: 'No',
          hint: 'Next js page routing',
        },
        {
          value: 'yes',
          label: 'Yes',
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
*/
main();
