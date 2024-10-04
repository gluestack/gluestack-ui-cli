#! /usr/bin/env node
import path from 'path';
import { cancel, text, select, log, spinner } from '@clack/prompts';
import chalk from 'chalk';
import fs from 'fs';
import { promisify } from 'util';
import { exec, execSync } from 'child_process';
import { displayHelp } from './help';
import templatesMap from './data.js';
const { gitRepo, tag, options } = templatesMap;

type RouterType = 'legacy' | 'latest';
type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';
const execPromise = promisify(exec);

interface ProjectOptions {
  projectType: string;
  router: RouterType;
  packageManager?: PackageManager;
  projectName: string;
}

async function createProject(createOptions: ProjectOptions) {
  const { projectName, projectType, packageManager, router } = createOptions;
  // Get the absolute path of the folder
  const projectPath = path.join(process.cwd(), projectName);

  // Check if the folder exists
  if (fs.existsSync(projectPath)) {
    throw new Error(
      `The folder '${projectName}' already exists in the current directory.`
    );
  }
  let createCommand = '';
  let message = '';
  if (projectType.includes('expo')) {
    // create expo project
    message = `⏳ Creating a new Expo project. Hang tight, this may take a bit...`;
    const templateFlag = router.includes('expo-router')
      ? ``
      : `--template blank-typescript`;

    switch (packageManager) {
      case 'npm':
        createCommand = `npx create-expo-app@latest ${projectName} ${templateFlag}`;
        break;
      case 'yarn':
        createCommand = `yarn create expo-app ${projectName} ${templateFlag}`;
        break;
      case 'pnpm':
        createCommand = `pnpm create expo-app ${projectName} ${templateFlag}`;
        break;
      case 'bun':
        createCommand = `bun create expo ${projectName} ${templateFlag}`;
        break;
    }
  } else if (projectType.includes('nextjs')) {
    // create next project
    message = `⏳ Creating a new NextJs project. Hang tight, this may take a bit...`;
    createCommand = projectType.includes('next-page-router')
      ? `npx create-next-app@latest ${projectName} --ts --no-eslint --use-${packageManager} --import-alias "@/*" --no-tailwind --no-src-dir --no-app`
      : `npx create-next-app@latest ${projectName} --ts --no-eslint --use-${packageManager} --import-alias "@/*" --no-tailwind --no-src-dir --app`;
  } else if (projectType.includes('react-native')) {
    // create react-native project
    const useCocoapods = router.includes('react-native-cli-cocoapods')
      ? true
      : false;
    createCommand = `npx @react-native-community/cli@latest init ${projectName} --pm ${packageManager} --install-pods ${useCocoapods}`;
  }
  const s = spinner();
  s.start(
    `⏳ Creating a react-native-cli project. Hang tight, this may take a bit...`
  );
  try {
    await execPromise(createCommand);
    s.stop(chalk.bold(`✅ Your project is ready!`));
  } catch (e) {
    s.stop(chalk.bold(`❌ An error occurred: ${e}`));
    throw e;
  }
}

async function initializeGluestack(projectOptions: ProjectOptions) {
  const { projectName, projectType, packageManager } = projectOptions;
  try {
    process.chdir(projectName);
    execSync(
      `npx gluestack-ui@alpha init --template-only --projectType ${projectType} --use-${packageManager}`,
      { stdio: 'inherit' }
    );
    execSync(`npx gluestack-ui@alpha add --all`, {
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('Failed to initialize gluestack-ui');
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
    '--react-native-cli',
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
    if (selectedFramework !== 'react-native-cli') {
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
    if (selectedFramework === 'react-native-cli') {
      const { question, options: optionsType } =
        // @ts-ignore
        options.framework.cocoaPods;
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

  // Add this check after determining the framework and package manager
  if (
    selectedFramework === 'react-native-cli' &&
    selectedPackageManager === 'pnpm'
  ) {
    log.warn(
      chalk.yellow(
        'React Native CLI does not officially support pnpm as a package manager. It is recommended to use npm or yarn instead.'
      )
    );
    process.exit(1);
  }

  const createOptions: ProjectOptions = {
    projectType: selectedFramework,
    router: selectedRouter as RouterType,
    packageManager: selectedPackageManager as PackageManager,
    projectName: projName,
  };
  try {
    // @ts-ignore
    // await cloneProject(projName, templateDir);
    // await installDependencies(projName, selectedPackageManager);
    await createProject(createOptions);
    await initializeGluestack(createOptions);
    console.log('done ...');
  } catch {
    console.error('Failed to create project');
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
