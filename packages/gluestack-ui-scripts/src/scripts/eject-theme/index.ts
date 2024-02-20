const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const findWorkspaceRoot = require('find-yarn-workspace-root');
const rootPath = process.cwd(); // You can customize this if needed

const workspaceRoot = findWorkspaceRoot(rootPath);
const warning = chalk.hex('#ffcc00');
const green = chalk.hex('#00FF00');

export const ejectTheme = async () => {
  console.log(chalk.yellow('⏳ Ejecting theme. Please wait...'));
  let srcPath;
  // Check if @gluestack-ui/config exists in node_modules
  if (
    fs.existsSync(path.join(rootPath, 'node_modules', '@gluestack-ui/config'))
  ) {
    srcPath = path.join(
      rootPath,
      'node_modules',
      '@gluestack-ui/config',
      'src'
    );
    copyFiles(srcPath);
  } else if (
    fs.existsSync(
      path.join(workspaceRoot, 'node_modules', '@gluestack-ui/config')
    )
  ) {
    srcPath = path.join(
      workspaceRoot,
      'node_modules',
      '@gluestack-ui/config',
      'src'
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

function copyFiles(srcPath: any) {
  // Check if @gluestack-ui/config exists in node_modules
  if (fs.existsSync(srcPath)) {
    try {
      fs.copySync(srcPath, path.join(rootPath, 'config'));
      // Removing components folder
      fs.removeSync(path.join(rootPath, 'config', 'components'));
      const successMessage = chalk.green(
        `✨ Congratulations! Your theme has been successfully ejected and can now be found in the ${green(
          `'config'`
        )} folder. ✨`
      );

      // Provide instructions for integrating the theme
      const instructionsBox = `                                                         
        ┌───────────────────────────────────────────────────────────────────────────────────────────┐
        │   // ${chalk.cyan(
          'App.tsx'
        )}                                                                              │
        │                                                                                           │
        │   ${chalk.cyan(
          'import { GluestackUIProvider }'
        )} from ${chalk.magenta(
          "'@gluestack-ui/themed'"
        )};                             │
        │   ${chalk.cyan('import { config }')} from ${chalk.magenta(
          "'./config/gluestack-ui.config'"
        )}; // Relative path to your ejected theme configuration │
        │                                                                                           │
        │   function App() {                                                                        │
        │     return (                                                                              │
        │       <${chalk.cyan(
          'GluestackUIProvider'
        )} config={config}>                                               │
        │         {/* Your app code */}                                                             │
        │       </${chalk.cyan(
          'GluestackUIProvider'
        )}>                                                              │
        │     );                                                                                    │
        │   }                                                                                       │
        │                                                                                           │
        └───────────────────────────────────────────────────────────────────────────────────────────┘
        `;

      // Create a closing message
      const closingMessage = chalk.bold(
        'Enjoy the enhanced beauty and functionality of your customized theme! 🚀✨'
      );

      // Combine and print the message

      console.log(successMessage);
      console.log(` 
        ${chalk.yellow(
          `To use it, simply import the configuration & pass it to the ${warning(
            'GluestackUIProvider'
          )} component')}`
        )}                                             
        ${chalk.yellow('into your app like shown below:')}         `);
      console.log(instructionsBox);
      console.log(closingMessage);
    } catch (err) {
      console.error('Error copying src folder:', err);
    }
  }
}
