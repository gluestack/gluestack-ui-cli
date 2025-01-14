#! /usr/bin/env node
import path from 'path';
import { cancel, text, select } from '@clack/prompts';
import { execSync } from 'child_process';
import { displayHelp } from './help';
import templatesMap from './data.js';
import chalk from 'chalk';
const { gitRepo, branch, options } = templatesMap;

export async function main(args: string[]) {
  console.log(chalk.bold.magenta('\nWelcome to gluestack-ui v2!'));
  console.log(chalk.yellow('Creating a new project with gluestack-ui v2.'));
  console.log(
    chalk.yellow(
      `Please use ${chalk.green(
        'npm create gluestack@1'
      )} to use gluestack-ui v1. \n`
    )
  );

  const supportedFrameworkArgs = ['--expo', '--next-app-router', '--universal'];

  const supportedStyleArgs = ['--gs', '--nw'];

  const supportedPackagemanagers = ['npm', 'yarn', 'pnpm', 'bun'];
  const supportedPackagemanagerArgs = supportedPackagemanagers.map(
    (manager) => '--use-' + manager
  );

  const supportedDocumentationArgs = ['--help', '-h'];

  let selectedFramework = '';
  let selectedStyle = '';
  let selectedPackageManager = '';
  let projName = '';

  if (args.length > 0) {
    if (args.some((arg) => supportedDocumentationArgs.includes(arg))) {
      // trigger help commmand and exit.
      displayHelp();
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
        displayHelp();
      }
    });
  }
  selectedStyle = 'nw';

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
  }

  if (projName === '') {
    projName = (await text({
      message: 'Enter the name of your project: ',
      placeholder: 'my-app',
      defaultValue: 'my-app',
    })) as string;
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

  const templateDir =
    templatesMap.map[templateName as keyof typeof templatesMap.map];

  if (templateName.includes('universal')) {
    console.log(
      `⏳ Creating a universal app. Hang tight, this may take a bit...`
    );
  } else if (templateName.includes('next')) {
    console.log(
      `⏳ Creating a next-app-router app. Hang tight, this may take a bit...`
    );
  } else if (templateName.includes('expo')) {
    console.log(`⏳ Creating a expo app. Hang tight, this may take a bit...`);
  }

  try {
    await cloneProject(projName, templateDir);
    if (!templateName.includes('universal')) {
      await installDependencies(projName, selectedPackageManager);
    }
    console.log('done ...');
  } catch (error: any) {
    console.error('Failed to create project');
    console.error(error.message);
    process.exit(1);
  }
}

async function cloneProject(projectName: string, templateName: string) {
  const dirPath = path.join(process.cwd(), projectName);
  // console.log(dirPath);
  // console.log('Cloning Project...');
  try {
    execSync(`mkdir ${projectName}`);
  } catch (error: any) {
    console.log(`Folder already exists with name: ${projectName}`);
    console.log('Overwriding the existing folder...');
    execSync(`rm -rf ${projectName}`);
    execSync(`mkdir ${projectName}`);
  }
  execSync('git init', { cwd: dirPath });
  execSync(`git remote add origin ${gitRepo}`, { cwd: dirPath });
  execSync('git config core.sparseCheckout true', { cwd: dirPath });
  execSync(
    `echo "apps/templates/${templateName}" >> .git/info/sparse-checkout`,
    {
      cwd: dirPath,
    }
  );
  execSync(`git pull origin ${branch}`, { cwd: dirPath });
  execSync(`mv apps/templates/${templateName}/* ./`, { cwd: dirPath });
  execSync('rm -rf apps', { cwd: dirPath });
  execSync('rm -rf .git', { cwd: dirPath });
  !templateName.includes('universal') &&
    execSync('mv gitignore .gitignore', { cwd: dirPath });
  execSync('git init', { cwd: dirPath });
  execSync('git branch -M main', { cwd: dirPath });
  execSync(`git add --all`, { cwd: dirPath });
  execSync(`git commit -m "Init"`, { cwd: dirPath });
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
