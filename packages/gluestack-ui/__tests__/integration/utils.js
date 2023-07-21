const { execSync } = require('child_process');
const { spawnSync } = require('child_process');

// Utility function to run an Expo project.
function runNextProject(projectPath) {
  try {
    const output = execSync(`yarn dev`, {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true,
    });
    console.log(output.toString());
    return true;
  } catch (error) {
    console.error('Error running Next project:', error);
    return false;
  }
}

function cleanUpPort(projectPath, NEXT_PORT) {
  try {
    // Kill any processes listening on the NEXT_PORT
    console.log(`Killing processes listening on port ${NEXT_PORT}...`);
    spawnSync(`kill -9 $(lsof -t -i:${NEXT_PORT})`, {
      cwd: projectPath,
      stdio: 'inherit',
      shell: true,
    });
  } catch (error) {
    console.error('Error occurred during my-next-app setup:');
    console.error(error);
  }
}

module.exports = {
  runNextProject,
  cleanUpPort,
};
