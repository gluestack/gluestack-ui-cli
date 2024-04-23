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
const workspaceRoot = findWorkspaceRoot(rootPath);
let isWorkSpace = false;
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
    // console.log('hello');

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
    isWorkSpace = true;
    // console.log('hello 2');

    srcPath = path.join(
      workspaceRoot,
      'node_modules',
      '@gluestack-ui/config',
      'src',
      'components'
    );
    await copyFiles(srcPath);
  } else {
    // console.log('hello 3');

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
  let localName: any;
  // @ts-ignore
  traverse(ast, {
    JSXOpeningElement(path) {
      // @ts-ignore
      if (path.node.name.name == localName) {
        path.node.attributes = path.node.attributes.filter((path) => {
          // @ts-ignore
          if (path.name.name == 'config') {
            return false;
          }
          return true;
        });
      }
    },

    ImportDeclaration(path) {
      if (path.node.source.value === '@gluestack-ui/themed') {
        path.traverse({
          ImportSpecifier(path) {
            // @ts-ignore
            if (path.node.imported.name == 'GluestackUIProvider') {
              localName = path.node.local.name;
            }
          },
        });
        if (!filePath.includes('registry.tsx')) {
          path.node.source.value = importPath;
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

async function installDependencies() {
  let srcPath;
  if (isWorkSpace) {
    srcPath = path.join(
      workspaceRoot,
      'node_modules',
      '@gluestack-ui/config',
      'package.json'
    );
  } else {
    srcPath = path.join(
      rootPath,
      'node_modules',
      '@gluestack-ui/config',
      'package.json'
    );
  }
  const rootPackageJson = require(path.join(rootPath, 'package.json'));
  const packageJson = require(srcPath);

  rootPackageJson.devDependencies = {
    ...rootPackageJson.devDependencies,
    ...packageJson.devDependencies,
    ...{ 'lucide-react-native': 'latest' },
  };

  fs.writeFileSync(
    path.join(rootPath, 'package.json'),
    synchronizedPrettier.format(JSON.stringify(rootPackageJson), {
      parser: 'json',
    })
  );
}

async function updateImports(
  folderName: string | symbol,
  importAs: string | symbol
) {
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
      chalk.red(
        `${green(`If you have already ejected the theme or components,`)}
- This will overwrite the existing styles with default one. (It is NOT RECOMMENDED to eject again)
- If you need to eject the components, then save the changes and copy/paste them manually.`
      )
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

        await installDependencies();
      }
      console.log(
        `${chalk.bold(
          `${chalk.green(`
           NOTE: Run npm install/yarn install/pnpm install once before running the project.
        `)}`
        )}`
      );
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
