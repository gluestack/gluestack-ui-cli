declare const addDependencies: (projectType?: string) => void;
declare function isStartingWithSrc(input: string): boolean;
declare function mergePaths(str1: string, str2: string): string;
declare const isFollowingSrcDir: () => boolean;
export { addDependencies, isFollowingSrcDir, isStartingWithSrc, mergePaths };
