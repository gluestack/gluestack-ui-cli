const { spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const templateData = require('./config');

const ejectCommand = templateData.ejectCommand;
const expoWebDepsCommand = templateData.expoWebDepsCommand;

// Check if the directory exists
async function execPromise(templateName, targetPath, targetName, changesPathRel, createCommand, createCommandArgs, guiInstallCommand, promptsList = [], eject = false, dotFiles = [], expoWeb = false) {

  const dirPath = path.join(__dirname, targetPath);
  const installPath = path.join(dirPath, targetName);
  const changesPath = path.join(__dirname, changesPathRel);
  
  console.log('Creating new template for', templateName);

  // Create the directory if it does not exist
  fs.ensureDirSync(dirPath);

  if (fs.existsSync(installPath)) {
    console.log(templateName, 'folder already exists.\nCleaning ...\n');
    fs.removeSync(installPath);
  }

  console.log('Installing...\n');

  // Create the command to eject the template
  const ejectCommandCLI = eject ? '&& ' + ejectCommand : '';

  // Create the command to install deps for using expo web
  const expoWebDepsInstallCommand = expoWeb ? '&& ' + expoWebDepsCommand : '';

  // Run the command
  const runCommand = `cd ${dirPath} && ${createCommand} ${targetName} ${createCommandArgs} && cd ${targetName} && ${guiInstallCommand} ${expoWebDepsInstallCommand} ${ejectCommandCLI}`;
  // console.log(runCommand);
  const createCommandCLI = spawn(runCommand, { shell: true, stdio: 'pipe' });

  createCommandCLI.stdin.setEncoding('utf-8');

  createCommandCLI.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
    if (data.includes('need to install')) {
    createCommandCLI.stdin.write('\n');
    }
    if(promptsList.length > 0) {
      for(promptObj of promptsList) {
        if(data.includes(promptObj.prompt)) {
          createCommandCLI.stdin.write(promptObj.userInput);
        }
      }
    }
  });

  // createCommandCLI.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  createCommandCLI.on('close', () => {
      console.log('Basic Template created successfully');
      console.log('Applying Patch...');
      replaceFiles(installPath, changesPath, dotFiles);
      console.log(templateName, 'template created successfully\n');
  });
};

const replaceFiles = (installPath, changesPath, dotFiles) => {
  const filesAndFolders = fs.readdirSync(changesPath);
  
  filesAndFolders.forEach(fileOrFolder => {
    const srcPath = path.join(changesPath, fileOrFolder);
    const destPath = path.join(installPath, fileOrFolder);
    fs.copySync(srcPath, destPath, { overwrite: true });
  });
};

// --template template-name
async function runner() {
  let templateList = process.argv.filter(item => !(item.includes('--') || item.includes('/')));
  if(templateList.length === 0) {
    templateList = Object.keys(templateData.template);
  }

  for(template of templateList) {
    if(templateData.template?.[template]) {

      const createCommand = templateData.template[template].createCommand;
      const createCommandArgs = templateData.template[template].createCommandArgs;
      const guiInstallCommand = templateData.template[template].installDeps;
      const targetPath = templateData.template[template].targetPath;
      const targetName = templateData.template[template].targetName;
      const patchPath = templateData.template[template].patchPath;
      const promptsList = templateData.template[template]?.promptsList;
      const eject = templateData.template[template]?.eject;
      const dotFiles = templateData.template[template]?.dotFiles;
      const expoWeb = templateData.template[template]?.expoWeb;

      await execPromise(template, targetPath, targetName, patchPath, createCommand, createCommandArgs, guiInstallCommand, promptsList, eject, dotFiles, expoWeb);
    } else {
      console.log('Error :', template, 'not found in the template list. Exiting...\n\n');
    }
  }
}

runner();