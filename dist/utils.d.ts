declare const getPackageJsonPath: () => string;
declare const installDependencies: () => Promise<void>;
declare const getConfigComponentPath: () => string;
declare const addIndexFile: (componentsDirectory: string, level?: number) => void;
declare const pascalToDash: (str: string) => string;
declare const dashToPascal: (str: string) => string;
export { getConfigComponentPath, installDependencies, addIndexFile, pascalToDash, dashToPascal, getPackageJsonPath, };
