// Node.js script to navigate into each package folder and run `yarn`

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Function to find package directories recursively
function findPackageDirs(dir, packageDirs = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // If the directory contains a package.json, add it to the list
      if (fs.existsSync(path.join(fullPath, "package.json"))) {
        packageDirs.push(fullPath);
      } else {
        // Recursively search in subdirectories
        findPackageDirs(fullPath, packageDirs);
      }
    }
  }

  return packageDirs;
}

// Function to run `yarn` in each package directory
function runYarnInPackages(packageDirs) {
  packageDirs.forEach((dir) => {
    console.log(`Running 'yarn' in ${dir}`);
    try {
      execSync("yarn", { stdio: "inherit", cwd: dir });
    } catch (error) {
      console.error(`Failed to run 'yarn' in ${dir}: ${error}`);
    }
  });
}

// Main script execution
const rootDir = path.join(process.cwd(), "packages");
const packageDirs = findPackageDirs(rootDir);
runYarnInPackages(packageDirs);
