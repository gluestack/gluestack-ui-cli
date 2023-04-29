declare const createFolders: (pathx: string) => void;
declare const removeClonedRepo: (sourcePath: string, repoName: string) => Promise<void>;
declare const cloneComponentRepo: (targetPath: string, gitURL: string) => Promise<void>;
declare const pullComponentRepo: (targetpath: string) => Promise<void>;
declare const checkIfFolderExists: (path: string) => Promise<boolean>;
declare const installDependencies: () => Promise<void>;
export { createFolders, removeClonedRepo, cloneComponentRepo, pullComponentRepo, checkIfFolderExists, installDependencies, };
