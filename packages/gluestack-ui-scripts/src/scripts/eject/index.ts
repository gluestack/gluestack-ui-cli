// import { confirm, log } from '@clack/prompts';
// import { execSync } from 'child_process';
// import { addGluestackConfig } from './add-config';
// import { componentAdder } from './add-components';
// import { projectDetector } from '@gluestack/ui-project-detector';
// import {
//   installDependencies,
//   cloneComponentRepo,
//   pullComponentRepo,
//   checkIfFolderExists,
//   dashToPascal,
// } from '../../utils';
// import util from 'util';
// const prettier = require('prettier');
// // import * as prettier from 'prettier';
// import { spinner } from '@clack/prompts';
// import os from 'os';
// const homeDir = os.homedir();
// import process from 'process';
// import path, { join } from 'path';
// import fs from 'fs-extra';
// const copyAsync = util.promisify(fs.copy);

// export const ejectComponents = async () => {
//   const projectType = await projectDetector();

//   const shouldContinue = await confirmCommand();
//   if (shouldContinue) {
//     const gitStatus = getGitStatus();
//     if (gitStatus) {
//       log.error(
//         `\x1b[31mThis git repository has untracked files or uncommitted changes:\x1b`
//       );

//       log.error(
//         `\x1b[31mRemove untracked files, stash or commit any changes, and try again.\x1b \n`
//       );
//       log.info(`${gitStatus
//         .split('\n')
//         .map((line: any) => {
//           return line?.match(/ .*/g)[0].trim();
//         })
//         .join('\n')}
//         `);

//       process.exit(1);
//     } else {
//       await getComponentGitRepo();
//       await addGluestackConfig();
//       await addProviders();
//       await componentAdder('--all', getInstallationMethod().forceUpdate);
//       await addIndexFile(path.join(process.cwd(), 'components'));
//       await installDependencies(getInstallationMethod().installationMethod);
//       await updateAlias(projectType.framework);
//     }
//   }
// };

// function updateAlias(projectType: string) {
//   if (projectType == 'Next') {
//     addAliasInNextApp();
//   }
//   if (projectType == 'Expo') {
//     addAliasInExpoApp();
//   }
// }

// const addAliasInExpoApp = () => {};

// function deepMerge(target: any, source: any) {
//   for (const key in source) {
//     if (source.hasOwnProperty(key)) {
//       if (source[key] instanceof Object && !Array.isArray(source[key])) {
//         if (!target[key]) {
//           target[key] = {};
//         }
//         deepMerge(target[key], source[key]);
//       } else {
//         target[key] = source[key];
//       }
//     }
//   }
//   return target;
// }

// const addAliasInNextApp = async () => {
//   // Updating Paths in tsconfig.json file
//   await writeConfig(join(process.cwd(), 'tsconfig.json'));
//   await writeConfig(join(process.cwd(), 'jsconfig.json'));
// };

// const writeConfig = async (configPath: string) => {
//   if (fs.existsSync(configPath)) {
//     const config = require(configPath);
//     let finalConfig: any = {};
//     if (config) {
//       if (config.compilerOptions) {
//         if (config.compilerOptions.paths) {
//           config.compilerOptions.paths = {
//             ...config.compilerOptions.paths,
//             // FIX: Change path if folder name changes
//             '@gluestack-ui/react': ['./components'],
//           };
//         } else {
//           finalConfig.compilerOptions = {};
//           finalConfig.compilerOptions.paths = {
//             '@gluestack-ui/react': ['./components'],
//           };
//         }
//       } else {
//         finalConfig.compilerOptions = {
//           paths: {
//             '@gluestack-ui/react': ['./components'],
//           },
//         };
//       }
//     }
//     finalConfig = JSON.stringify(deepMerge(config, finalConfig), null, 2);

//     // finalConfig = await prettier.format(JSON.stringify(finalConfig), {
//     //   semi: false,
//     //   parser: 'json-stringify',
//     // });
//     const res = fs.writeFileSync(configPath, finalConfig);
//   }
// };

// const getInstallationMethod = () => {
//   let supportedArgs = ['--use-npm', '--use-yarn', '--use-pnpm'];
//   const args = process.argv.splice(4);
//   let installationMethod;
//   let forceUpdate;

//   for (let i = 0; i < args.length; i++) {
//     if (supportedArgs.includes(args[i])) {
//       if (args[i] === '--use-npm') {
//         installationMethod = 'npm install --legacy-peer-deps';
//       } else if (args[i] === '--use-yarn') {
//         installationMethod = 'yarn';
//       } else if (args[i] === '--use-pnpm') {
//         installationMethod = 'pnpm i --lockfile-only';
//       } else if (args[i] === '--force-update') {
//         forceUpdate = true;
//       }
//     } else {
//       log.warning(
//         `Unsupported argument: ${args[i]}. For more information run npx gluestack-ui help`
//       );
//       if (!(args[i].startsWith('-') || args[i].startsWith('--'))) {
//         log.warning(`Please pass project name as first argument.`);
//       }
//       process.exit(0);
//     }
//   }
//   return { installationMethod, forceUpdate };
// };

// async function confirmCommand() {
//   const shouldContinue = await confirm({
//     message: 'Are you sure you want to eject? This action is permanent.',
//   });
//   if (!shouldContinue) {
//     process.exit(1);
//   } else {
//     return true;
//   }
// }

// const getComponentGitRepo = async (): Promise<void> => {
//   try {
//     // Clone repo locally in users home directory
//     const cloneLocation = path.join(homeDir, '.gluestack', 'cache');
//     const clonedPath = path.join(cloneLocation, 'gluestack-ui');
//     const clonedRepoExists = await checkIfFolderExists(clonedPath);

//     if (clonedRepoExists) {
//       log.step('Repository already cloned.');
//       await pullComponentRepo(clonedPath);
//     } else {
//       const s = spinner();
//       s.start('Cloning repository...');
//       // createFolders(cloneLocation);
//       await cloneComponentRepo(
//         clonedPath,
//         'https://github.com/gluestack/gluestack-ui.git'
//       );
//       s.stop('Repository cloned successfully.');
//     }
//   } catch (err) {
//     log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
//   }
// };

// function getGitStatus() {
//   try {
//     let stdout = execSync(`git status --porcelain`, {
//       stdio: ['pipe', 'pipe', 'ignore'],
//     }).toString();
//     return stdout.trim();
//   } catch (e) {
//     return '';
//   }
// }

// const addIndexFile = (componentsDirectory: string, level = 0) => {
//   try {
//     const files = fs.readdirSync(componentsDirectory);

//     const exports = files
//       .filter(
//         file =>
//           file !== 'index.js' && file !== 'index.tsx' && file !== 'index.ts'
//       )
//       .map(file => {
//         const stats = fs.statSync(`${componentsDirectory}/${file}`);
//         if (stats.isDirectory()) {
//           if (level === 0) {
//             addIndexFile(`${componentsDirectory}/${file}`, level + 1);
//           }

//           return `export * from './${file.split('.')[0]}';`;
//         } else {
//           return '';
//         }
//       })
//       .join('\n');

//     fs.writeFileSync(
//       path.join(componentsDirectory, 'index.ts'),
//       exports.includes('./core')
//         ? exports +
//             `\nexport { config } from "./../gluestack-ui.config";
//     `
//         : exports
//     );
//   } catch (err) {
//     log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
//   }
// };

// const addProviders = async () => {
//   const sourcePath = path.join(
//     homeDir,
//     '.gluestack',
//     'cache',
//     'gluestack-ui',
//     'example',
//     'storybook',
//     'src',
//     'ui-components'
//   );
//   // FIX: remove hardcoded components value
//   const targetPath = path.join(process.cwd(), 'components');
//   try {
//     // Copy Provider and styled folder
//     await copyAsync(
//       path.join(sourcePath, 'Provider'),
//       path.join(targetPath, 'core', 'GluestackUIProvider')
//     );
//     await copyAsync(
//       path.join(sourcePath, 'styled'),
//       path.join(targetPath, 'core', 'styled')
//     );

//     // Delete config.json files
//     fs.unlinkSync(
//       path.join(targetPath, 'core', 'GluestackUIProvider', 'config.json')
//     );
//     fs.unlinkSync(path.join(targetPath, 'core', 'styled', 'config.json'));
//   } catch (err) {
//     log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
//   }
// };
