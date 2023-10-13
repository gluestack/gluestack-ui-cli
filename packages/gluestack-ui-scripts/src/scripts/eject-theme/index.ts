const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

// Define the paths
const srcPath = path.join(
  process.cwd(),
  'node_modules',
  '@gluestack-ui/config',
  'src'
);
const warning = chalk.hex('#ffcc00');
const green = chalk.hex('#00FF00');

const rootPath = process.cwd(); // You can customize this if needed

export const ejectTheme = async () => {
  console.log(chalk.yellow('⏳ Ejecting theme. Please wait...'));
  // Check if @gluestack-ui/config exists in node_modules
  if (fs.existsSync(srcPath)) {
    try {
      // Copy the src folder to the root directory
      fs.copySync(srcPath, path.join(rootPath, 'config'));

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
      │   ${chalk.cyan('import { GluestackUIProvider }')} from ${chalk.magenta(
        "'@gluestack-ui/themed'"
      )};                             │
      │   ${chalk.cyan('import { config }')} from ${chalk.magenta(
        "'./config'"
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
  } else {
    console.error(
      chalk.red.bold('❌ Error:'),
      "The '@gluestack-ui/config' package was not found in node_modules. Please run",
      chalk.cyan('npm install @gluestack-ui/config@latest'),
      'to install it.'
    );
  }
};
