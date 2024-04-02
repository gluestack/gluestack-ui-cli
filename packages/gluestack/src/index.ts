#! /usr/bin/env node
import path from 'path';
import { cancel, text, select } from '@clack/prompts';
import { execSync } from 'child_process';
import { displayHelp } from './help';
import templatesMap from './data.js';
const { gitRepo, tag, options } = templatesMap;

const args = process.argv.slice(2);

const supportedFrameworkArgs = [
  '--expo',
  '--expo-router',
  '--next-app-router',
  '--next-page-router',
  '--react-native',
];

const supportedStyleArgs = ['--gs', '--nw'];

const supportedPackagemanagers = ['npm', 'yarn', 'pnpm', 'bun'];
const supportedPackagemanagerArgs = supportedPackagemanagers.map(
  (manager) => '--use-' + manager
);

const supportedDocumentationArgs = ['--help', '-h'];

let supportedArgs = [
  // frameworks
  ...supportedFrameworkArgs,
  // style options
  ...supportedStyleArgs,
  // package manager
  ...supportedPackagemanagerArgs,
  // documentation
  ...supportedDocumentationArgs,
];

let selectedFramework = '';
let selectedRouter = '';
let selectedStyle = '';
let selectedPackageManager = '';
let projName = '';

if (args.length > 0) {
  if (args.some((arg) => supportedDocumentationArgs.includes(arg))) {
    // trigger help commmand and exit.
    displayHelp(options);
  }

  if (!args[0].startsWith('-')) {
    projName = args[0];
    args.shift();
  }
  args.forEach((arg) => {
    if (supportedFrameworkArgs.includes(arg)) {
      selectedFramework = arg.slice(2);
    } else if (supportedStyleArgs.includes(arg)) {
      selectedStyle = arg.slice(2);
    } else if (supportedPackagemanagerArgs.includes(arg)) {
      selectedPackageManager = arg.slice(6);
    } else {
      console.log(`Unsupported argument: ${arg}\n`);
      displayHelp(options);
    }
  });
}

async function main() {
  process.on('SIGINT', function () {
    cancel('Operation cancelled.');
    process.exit(0);
  });
  let templateName = selectedFramework;
  if (templateName === '') {
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
  }
  templateName = `${templateName}-${selectedStyle}`;

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
  const dirPath = path.join(process.cwd(), projectName);
  // console.log(dirPath);
  // console.log('Cloning Project...');
  // try {
  execSync(`mkdir ${projectName}`);
  // } catch (error: any) {
  //   console.log(`Folder already exists with name: ${projectName}`);
  //   console.log('Overwriding the existing folder...');
  //   execSync(`rm -rf ${projectName}`);
  //   execSync(`mkdir ${projectName}`);
  // }
  execSync('git init', { cwd: dirPath });
  execSync(`git remote add origin ${gitRepo}`, { cwd: dirPath });
  execSync('git config core.sparseCheckout true', { cwd: dirPath });
  execSync(
    `echo "apps/templates/${templateName}" >> .git/info/sparse-checkout`,
    {
      cwd: dirPath,
    }
  );
  execSync(`git pull origin ${tag}`, { cwd: dirPath });
  execSync(`mv apps/templates/${templateName}/* ./`, { cwd: dirPath });
  execSync('rm -rf apps', { cwd: dirPath });
  execSync('rm -rf .git', { cwd: dirPath });
  execSync('mv gitignore .gitignore', { cwd: dirPath });
  execSync('git init', { cwd: dirPath });
  execSync('git add .', { cwd: dirPath });
  execSync('git commit -m "init"', { cwd: dirPath });
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

main();
