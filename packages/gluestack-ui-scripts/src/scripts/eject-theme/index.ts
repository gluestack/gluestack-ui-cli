import { confirm, log } from '@clack/prompts';
import { execSync } from 'child_process';
import util from 'util';
import process from 'process';
import path from 'path';
import fs from 'fs-extra';
const copyAsync = util.promisify(fs.copy);
// Get Yarn workspace root
import findYarnWorkspaceRoot from 'find-yarn-workspace-root';

export const ejectTheme = async () => {
  const shouldContinue = await confirmCommand();
  if (shouldContinue) {
    const workspaceRoot = findYarnWorkspaceRoot();
    const isGUIThemedInstalled = checkGUIThemedInstalledOrNot(
      '@gluestack-ui/themed',
      process.cwd(),
      workspaceRoot ?? process.cwd()
    );

    const gitStatus = getGitStatus();
    console.log(isGUIThemedInstalled, gitStatus);
    if (gitStatus) {
      log.error(
        `\x1b[31mThis git repository has untracked files or uncommitted changes:\x1b`
      );

      log.error(
        `\x1b[31mRemove untracked files, stash or commit any changes, and try again.\x1b \n`
      );
      log.info(`${gitStatus
        .split('\n')
        .map((line: any) => {
          return line?.match(/ .*/g)[0].trim();
        })
        .join('\n')}
        `);

      process.exit(1);
    } else {
      if (isGUIThemedInstalled) {
        // copy theme folder from the gluestackui package into the current directory
        const sourcePath = path.join(isGUIThemedInstalled, 'build');
        const targetPath = path.join(process.cwd(), 'theme');
        try {
          // Copy theme folder
          await copyAsync(sourcePath, targetPath);
        } catch (err) {
          log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
        }
      }
    }
  }
};

async function confirmCommand() {
  const shouldContinue = await confirm({
    message:
      'Are you sure you want to eject the theme? This action is permanent.',
  });
  if (!shouldContinue) {
    process.exit(1);
  } else {
    return true;
  }
}

function getGitStatus() {
  try {
    let stdout = execSync(`git status --porcelain`, {
      stdio: ['pipe', 'pipe', 'ignore'],
    }).toString();
    return stdout.trim();
  } catch (e) {
    return '';
  }
}

function checkGUIThemedInstalledOrNot(
  packageName: string,
  currentDir: string,
  workspaceRoot: string
) {
  const nodeModulesPath = path.join(currentDir, 'node_modules');
  const packagePath = path.join(nodeModulesPath, packageName);
  if (fs.existsSync(packagePath)) {
    console.log(`Found ${packageName} at: ${packagePath}`);
    return packagePath;
  }
  // Check if we've reached the workspace root
  if (currentDir === workspaceRoot) {
    console.log(`${packageName} not found in workspace.`);
    return null;
  }
  // Go up one directory level
  const parentDir = path.dirname(currentDir);
  return checkGUIThemedInstalledOrNot(packageName, parentDir, workspaceRoot);
}
