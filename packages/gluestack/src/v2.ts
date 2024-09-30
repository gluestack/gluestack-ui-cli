#! /usr/bin/env node
import path from 'path';
import { cancel, text, select } from '@clack/prompts';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { displayHelp } from './help';
import templatesMap from './data.js';
const { gitRepo, tag, options } = templatesMap;

type RouterType = 'legacy' | 'latest';
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

interface ProjectOptions {
  projectType: string;
  router: RouterType;
  packageManager?: PackageManager;
  projectName: string;
}

async function createProject(createOptions: ProjectOptions) {
  const { projectName, projectType, packageManager, router } = createOptions;
  let createCommand = '';
  console.log(`Creating project: ${chalk.blue(projectName)}`);

  if (projectType.includes('expo')) {
    // create expo project

    createCommand = router.includes('expo-router')
      ? `npx create-expo-app@latest ${projectName} --template expo-template-blank-typescript --use-${packageManager}`
      : `npx create-expo-app@latest ${projectName} --template typescript --use-${packageManager}`;
  } else if (projectType.includes('nextjs')) {
    // create next project

    createCommand = projectType.includes('next-page-router')
      ? `npx create-next-app@latest ${projectName} --ts --use-${packageManager}`
      : `npx create-next-app@latest ${projectName} --ts --use-${packageManager}`;
  } else if (projectType.includes('react-native')) {
    // create react-native project

    createCommand = `npx @react-native-community/cli@latest init ${projectName} --use-${packageManager}`;
  }
  try {
    execSync(createCommand, { stdio: 'inherit' });
    console.log(`Successfully created project: ${projectName}`);
  } catch (e) {
    console.error(`Failed to create project: ${e}`);
    throw e;
  }
}

async function initializeGluestack(projectOptions: ProjectOptions) {
  const { projectName, packageManager, projectType } = projectOptions;
  try {
    execSync(`cd ${projectName}`, { stdio: 'inherit' });
    execSync(
      `npx gluestack-ui@alpha init --template-only --projectType ${projectType} --use-${packageManager}`,
      { stdio: 'inherit' }
    );
    execSync(`npx gluestack-ui@alpha add --all --use-${packageManager}`, {
      stdio: 'inherit',
    });
  } catch (e) {
    console.log('Failed to initialize gluestack-ui');
    throw e;
  }
}

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

  const supportedFrameworkArgs = [
    '--expo',
    '--expo-router',
    '--next-app-router',
    '--next-page-router',
    '--react-native',
  ];
  const supportedStyleArgs = ['--gs', '--nw'];
  const supportedPackagemanagers = ['npm', 'yarn', 'pnpm', 'bun'];
  const supportedDocumentationArgs = ['--help', '-h'];
  const supportedPackagemanagerArgs = supportedPackagemanagers.map(
    (manager) => '--use-' + manager
  );

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
  const createOptions: ProjectOptions = {
    projectType: selectedFramework,
    router: selectedRouter as RouterType,
    packageManager: selectedPackageManager as PackageManager,
    projectName: projName,
  };
  console.log('createOptions--->', createOptions);
  try {
    // @ts-ignore
    // await cloneProject(projName, templateDir);
    // await installDependencies(projName, selectedPackageManager);
    await createProject(createOptions);
    // await initializeGluestack(createOptions);
    console.log('done ...');
  } catch {
    console.log('Failed to create project');
    process.exit(1);
  }
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
