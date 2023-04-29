import addDependencies from '../utils';
const expoInstaller = async () => {
  try {
    addDependencies();
  } catch (err) {
    console.log(
      '\x1b[31m%s\x1b[0m',
      `Error in Expo installer: ${(err as Error).message}`
    );
  }
};

export { expoInstaller };
