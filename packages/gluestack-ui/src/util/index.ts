import os from 'os';
import path from 'path';
import util from 'util';
import fs from 'fs-extra';
import { log, spinner } from '@clack/prompts';
import simpleGit from 'simple-git';

const stat = util.promisify(fs.stat);
const homeDir = os.homedir();
const gluestackDir = path.join(homeDir, '.gluestack', 'cache', 'gluestack-ui');
const repoUrl = 'https://github.com/gluestack/gluestack-ui.git';

const cloneRepositoryAtRoot = async () => {
  const clonedRepoExists = await checkIfFolderExists(gluestackDir);
  if (clonedRepoExists) {
    log.step('Repository already cloned.');
    await pullComponentRepo(gluestackDir);
  } else {
    const s = spinner();
    s.start('Cloning repository...');
    await cloneComponentRepo(gluestackDir, repoUrl);
    s.stop('Repository cloned successfully.');
  }
};

const cloneComponentRepo = async (
  targetPath: string,
  gitURL: string
): Promise<void> => {
  const git = simpleGit();
  const s = spinner();
  s.start('⏳ Cloning repository...');

  try {
    await git.clone(gitURL, targetPath);
    s.stop('\x1b[32m' + 'Cloning successful.' + '\x1b[0m');
  } catch (err) {
    s.stop('\x1b[31m' + 'Cloning failed' + '\x1b[0m');
    log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
  }
};

const pullComponentRepo = async (targetpath: string): Promise<void> => {
  const s = spinner();
  s.start('⏳ Pulling latest changes...');
  let retry = 0;
  let success = false;
  while (!success && retry < 3) {
    try {
      await wait(1000);
      await tryGitPull(targetpath);
      success = true;
    } catch (err) {
      log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
      log.error(
        `\x1b[31mPulling failed - retrying... (Attempt ${retry + 1})\x1b[0m`
      );
      retry++;
    }
  }
  if (!success) s.stop('\x1b[31m' + 'Pulling failed!' + '\x1b[0m');
  else s.stop('\x1b[32m' + 'Git pull successful.' + '\x1b[0m');
};

const tryGitPull = async (targetPath: string): Promise<void> => {
  const git = simpleGit(targetPath);
  if (fs.existsSync(targetPath)) {
    try {
      await git.pull('origin', 'main');
    } catch (err) {
      log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    }
  } else log.error('\x1b[31m' + 'Target path does not exist' + '\x1b[0m');
};

const checkIfFolderExists = async (path: string): Promise<boolean> => {
  try {
    const stats = await stat(path);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

const wait = (msec: number): Promise<void> =>
  new Promise<void>((resolve, _) => {
    setTimeout(resolve, msec);
  });

export { cloneRepositoryAtRoot, pullComponentRepo, checkIfFolderExists };
