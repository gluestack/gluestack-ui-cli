#! /usr/bin/env node
import { cancel, text, select } from '@clack/prompts';
import { displayHelp } from './help';
import templatesMap from './data.js';
import chalk from 'chalk';
import { cloneProject, gitInit, installDependencies } from './utils';

const { options } = templatesMap;

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

  // Universal Template coming soon...
  if (templateName.includes('universal')) {
    console.log(chalk.bgGreen('\nComing Soon...\n'));
    process.exit(0);
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

  let message = '';
  if (templateName.includes('universal')) {
    message = 'a universal';
  } else if (templateName.includes('next')) {
    message = 'a next-app-router';
  } else if (templateName.includes('expo')) {
    message = 'an expo';
  }
  console.log(
    `⏳ Creating ${message} app. Hang tight, this may take a while...\n`
  );

  try {
    await cloneProject(projName, templateDir);
    if (!templateName.includes('universal')) {
      await installDependencies(projName, selectedPackageManager);
    }
    await gitInit(projName);
    console.log(
      chalk.green(
        '\nProject created successfully in ' + projName + ' folder.\n'
      )
    );
  } catch (error: any) {
    console.error('Failed to create project');
    console.error(error.message);
    process.exit(1);
  }
}
