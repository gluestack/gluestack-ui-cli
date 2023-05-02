declare const checkForExistingFolders: (specificComponents: string[]) => Promise<string[]>;
declare const getAllComponents: (source: string) => string[];
declare const componentAdder: (requestedComponent?: string, showWarning?: boolean) => Promise<void>;
declare const getComponentGitRepo: () => Promise<void>;
declare const initialProviderAdder: (componentFolderPath: string) => Promise<void>;
export { componentAdder, initialProviderAdder, getComponentGitRepo, checkForExistingFolders, getAllComponents, };
