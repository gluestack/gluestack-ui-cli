const { execSync } = require('child_process');

// Utility function to create an Expo project in the specified path.
function createExpoProject(projectPath) {
  try {
    execSync(`expo init ${projectPath} --npm`);
    return true;
  } catch (error) {
    console.error('Error creating Expo project:', error);
    return false;
  }
}

// Utility function to run an Expo project.
function runExpoProject(projectPath) {
  try {
    const output = execSync(`cd ${projectPath} && expo start`);
    console.log(output.toString());
    return true;
  } catch (error) {
    console.error('Error running Expo project:', error);
    return false;
  }
}

// Utility function to delete a directory and its contents recursively.
function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const currentPath = path.join(dirPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        deleteDirectory(currentPath);
      } else {
        fs.unlinkSync(currentPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

module.exports = {
  createExpoProject,
  runExpoProject,
  deleteDirectory,
};
