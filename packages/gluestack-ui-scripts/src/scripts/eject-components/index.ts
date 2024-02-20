import { execSync } from 'child_process';
import { constrainedMemory } from 'process';
import { ParseResult, parse } from '@babel/parser';
import generate from '@babel/generator';
import { File } from '@babel/types';
import traverse from '@babel/traverse';
import { confirm, select, text } from '@clack/prompts';
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const findWorkspaceRoot = require('find-yarn-workspace-root');
const rootPath = process.cwd(); // You can customize this if needed
// const jscodeshift = require('jscodeshift');
const {
  parseSync,
  transformFromAstSync,
  transformSync,
} = require('@babel/core');
const babelPlugin = require('./transform.js');
const workspaceRoot = findWorkspaceRoot(rootPath);
const { run: jscodeshift } = require('jscodeshift/src/Runner');
const jsPath = require('node:path');
import * as prettier from 'prettier';
// Define the paths
import synchronizedPrettier from '@prettier/sync';

// => 'foo();\n'
const warning = chalk.hex('#ffcc00');
const green = chalk.hex('#00FF00');

export const ejectComponents = async () => {
  let srcPath;
  // Check if @gluestack-ui/config exists in node_modules
  if (
    fs.existsSync(path.join(rootPath, 'node_modules', '@gluestack-ui/config'))
  ) {
    srcPath = path.join(
      rootPath,
      'node_modules',
      '@gluestack-ui/config',
      'src',
      'components'
    );
    await copyFiles(srcPath);
  } else if (
    fs.existsSync(
      path.join(workspaceRoot, 'node_modules', '@gluestack-ui/config')
    )
  ) {
    srcPath = path.join(
      workspaceRoot,
      'node_modules',
      '@gluestack-ui/config',
      'src',
      'components'
    );
    copyFiles(srcPath);
  } else {
    console.error(
      chalk.red.bold('❌ Error:'),
      "The '@gluestack-ui/themed' package was not found in node_modules. Please run",
      chalk.cyan('npm install @gluestack-ui/themed@latest'),
      'to install it.'
    );
  }
};

function getAllFilesWithExtension(
  dir: string,
  extension: string,
  fileList: string[] = []
): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file: any) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      fileList = getAllFilesWithExtension(filePath, extension, fileList);
    } else {
      if (path.extname(file) === extension) {
        fileList.push(filePath);
      }
    }
  });
  return fileList;
}

async function updateSourceCode(
  filePath: string,
  folderName: string | symbol,
  importAs: string | symbol
) {
  const source = fs.readFileSync(filePath, 'utf8');
  const ast = parse(source, {
    sourceFilename: filePath,
    sourceType: 'module',
    plugins: [
      // enable jsx and flow syntax
      'jsx',
      'typescript',
    ],
  });
  let importPath: any;
  if (importAs == 'relative') {
    importPath = path.relative(
      path.dirname(filePath),
      path.join(rootPath, folderName)
    );
  }
  // If relativePath is empty, set it to '.'
  importPath = importPath || '.';

  // Add './' to the relative path
  importPath = `.${path.sep}${importPath}`;

  // @ts-ignore
  traverse(ast, {
    ImportDeclaration(path) {
      if (path.node.source.value === '@gluestack-ui/themed') {
        if (importAs == 'relative') {
          path.node.source.value = importPath;
        } else {
          // @ts-ignore
          path.node.source.value = importAs;
        }
      }
    },
  });

  // @ts-ignore
  const code = generate(ast).code;
  const formattedString = synchronizedPrettier.format(code, {
    parser: 'babel',
  });
  fs.writeFileSync(filePath, formattedString);
}

async function updateImports(
  folderName: string | symbol,
  importAs: string | symbol
) {
  // console.log(folderName);
  const projectDir = rootPath;
  const extension = '.tsx';
  const allTSXFiles = getAllFilesWithExtension(projectDir, extension);
  const allJSXFile = getAllFilesWithExtension(projectDir, '.jsx');
  const allJSFile = getAllFilesWithExtension(projectDir, '.js');

  [...allTSXFiles, ...allJSXFile, ...allJSFile].map(async (file: string) => {
    if (
      !file.includes('node_modules') &&
      !file.includes('.expo') &&
      !file.includes('.next') &&
      !file.includes('components')
    ) {
      const res = await updateSourceCode(file, folderName, importAs);
    }
  });
}

async function copyFiles(srcPath: any) {
  console.log(
    chalk.yellow(
      `⏳ Ejecting Components & Theme will copy all the themed components inside ${green(
        `'./components'`
      )} folder.`
    )
  );

  console.log(
    '\n',
    chalk.bold(
      chalk.green(
        `Commit you changes before ejecting, this command with update the imports!!`
      )
    )
  );
  console.log(
    '\n',
    chalk.bold(
      chalk.red(
        `If you have already ejected the theme or components once, it is recommended to not eject again. This will overwrite the existing styles with default one. If you need to eject the components, then save the changes and copy/paste them manually.`
      )
    )
  );
  console.log(
    '\n',
    chalk.bold(
      chalk.yellow(
        `If you are already using ${green(
          '@gluestack-ui/themed'
        )} inside your project, running this command will automatically change the imports from ${green(
          '@gluestack-ui/themed'
        )} to the ${green('components')} folder path. `
      )
    )
  );
  if (fs.existsSync(srcPath)) {
    try {
      const shouldContinue = await select({
        message: 'Are you sure you want to continue?',
        options: [
          { value: true, label: 'Yes' },
          { value: false, label: 'No' },
        ],
      });
      let importPathName: any;
      if (shouldContinue) {
        const folderName: string | symbol = await text({
          message: 'Enter folder name where you want ejected components.',
          placeholder: 'components',
          defaultValue: 'components',
        });

        const importAs = await select({
          message: 'How do you want to import the components?',
          options: [
            {
              value: 'relative',
              label: 'Relative Path',
              hint: './components',
            },
            {
              value: 'absolute',
              label: 'Absolute Path',
              hint: '@/components/ui, to use this, you need to connfigure paths manually!',
            },
          ],
        });

        if (importAs == 'absolute') {
          importPathName = await text({
            message: 'Enter the absolute path to used in imports',
            placeholder: '@/components/ui',
            defaultValue: '@/components/ui',
          });
        } else {
          importPathName = importAs;
        }

        console.log(
          chalk.yellow(
            `⏳ Ejecting Components & Theme inside ${JSON.stringify(
              folderName
            )}. Please wait...`
          )
        );

        fs.copySync(srcPath, path.join(rootPath, folderName));

        await updateImports(folderName, importPathName);
      }
      const successMessage = chalk.green(
        `✨ Congratulations! Your styled components have been successfully ejected and can now be found in the ${green(
          `'components'`
        )} folder. ✨`
      );
      const closingMessage = chalk.bold(
        'Enjoy the enhanced beauty and functionality of your customized theme! 🚀✨'
      );

      // Combine and print the message
      console.log(successMessage);

      console.log(closingMessage);
    } catch (err) {
      console.error('Error copying src folder:', err);
    }
  } else {
    console.log(` 
      ${chalk.red(`Please update the version of @gluestack-ui/config.`)}     
      Try Running:                                            
      ${chalk.cyan(`npm i @gluestack-ui/config@latest`)}
      OR
      ${chalk.cyan(`yarn add @gluestack-ui/config@latest`)} 
    `);
  }
}

const configInstructionsBox = `${chalk.gray(
  `    ┌───────────────────────────────────────────────────────────────────────────────────────────┐`
)}
${chalk.gray(
  `│   // ${chalk.cyan(
    'babel.config.js'
  )}                                                                      │`
)}
${chalk.gray(
  `│   // Relative path to your ejected components                                             │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `const path = require('path')`
  )};                                                           │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `module.exports = function (api) {`
  )}                                                       │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    ` api.cache(true)`
  )}                                                                        │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    ` return {`
  )}                                                                               │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `    plugins: [`
  )}                                                                          │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `      [`
  )}                                                                                 │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `        'module-resolver',`
  )}                                                              │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `        {`
  )}                                                                               │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `          alias: {`
  )}                                                                      │`
)}
${chalk.gray(
  `│   ${chalk.magenta(
    `            '@gluestack-ui/themed': path.join(`
  )}                                          │`
)}
${chalk.gray(
  `│   ${chalk.magenta(
    `              __dirname,`
  )}                                                                │`
)}
${chalk.gray(
  `│   ${chalk.magenta(
    `              '../components'`
  )};                                                          │`
)}
${chalk.gray(
  `│   ${chalk.magenta(
    `             ),`
  )}                                                                         │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `          },`
  )}                                                                            │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `        },`
  )}                                                                              │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `      ],`
  )}                                                                                │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `      '@babel/plugin-transform-modules-commonjs',`
  )}                                       │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `    ],`
  )}                                                                                  │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `  }`
  )}                                                                                     │`
)}
${chalk.gray(
  `│   ${chalk.cyan(
    `}`
  )}                                                                                       │`
)}
${chalk.gray(
  `│                                                                                           │`
)}
${chalk.gray(
  `│                                                                                           │`
)}
${chalk.gray(
  `└───────────────────────────────────────────────────────────────────────────────────────────┘`
)}`;
