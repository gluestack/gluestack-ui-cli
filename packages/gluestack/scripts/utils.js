const { ensureDir, pathExists, remove, readdir, copy } = require('fs-extra');
const { spawn, spawnSync } = require('child_process');
const { join } = require('path');

// Check if the directory exists
async function execPromise(
  templateName,
  targetPath,
  targetName,
  patchPath,
  createCommand,
  createCommandArgs = '',
  promptsList = [],
  postCreate = []
) {
  const dirPath = join(__dirname, targetPath);
  const installPath = join(dirPath, targetName);

  console.log('\nCreating new template for', templateName, '\n');

  // Create the directory if it does not exist
  await ensureDir(dirPath);

  if (await pathExists(installPath)) {
    console.log(templateName, 'folder already exists.\nCleaning...');
    await remove(installPath);
  }

  console.log('Installing...');

  // Run the command
  const runCommand = `${createCommand} ${targetName} ${createCommandArgs}`;
  // console.log('runCommand', runCommand);
  const createCommandCLI = spawn(runCommand, {
    cwd: dirPath,
    shell: true,
    stdio: 'pipe',
  });

  createCommandCLI.stdin.setEncoding('utf-8');

  createCommandCLI.stdout.on('data', (data) => {
    // console.log(`stdout: ${data}`);
    if (data.includes('need to install')) {
      createCommandCLI.stdin.write('\n');
    }
    if (promptsList.length > 0) {
      for (promptObj of promptsList) {
        if (data.includes(promptObj.prompt)) {
          createCommandCLI.stdin.write(promptObj.userInput);
        }
      }
    }
  });

  // createCommandCLI.stderr.on('data', (data) => {
  //   console.error(`stderr: ${data}`);
  // });

  createCommandCLI.on('close', async () => {
    // install dependancies and apply patches
    console.log('Basic Template created successfully');
    // is post create command exists, run it
    if (postCreate && postCreate.length > 0) {
      console.log('Running postCreate script...');
      const postCreateCLI = postCreate.join(' && ');
      spawnSync(postCreateCLI, {
        cwd: installPath,
        shell: true,
        stdio: 'pipe',
      });
    }
    console.log('Applying Patch...');
    await installPatch(patchPath, installPath);
    await dotFiles(installPath);
    console.log(templateName, 'template created successfully\n');
  });
}

async function installPatch(patchPath, installPath) {
  for (const patch of patchPath) {
    const patchDir = join(__dirname, patch);
    const patchConfig = require(join(patchDir, 'config.json'));
    if (patchConfig.dependencies.length > 0) {
      const dependencies = patchConfig.dependencies.join(' ');
      spawnSync(`yarn add ${dependencies}`, {
        cwd: installPath,
        shell: true,
        stdio: 'pipe',
      });
    }
    await replaceFiles(installPath, patchDir);
  }
  if (await pathExists(join(installPath, 'config.json'))) {
    // If it exists, remove it
    await remove(join(installPath, 'config.json'));
  }
}

async function replaceFiles(installPath, changesPath) {
  const filesAndFolders = await readdir(changesPath);

  for (const fileOrFolder of filesAndFolders) {
    const srcPath = join(changesPath, fileOrFolder);
    const destPath = join(installPath, fileOrFolder);
    await copy(srcPath, destPath, { overwrite: true });
  }
}

async function dotFiles(installPath) {
  spawnSync('cp .gitignore gitignore', {
    cwd: installPath,
    shell: true,
    stdio: 'pipe',
  });
}

module.exports = { execPromise };
