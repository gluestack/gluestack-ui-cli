declare const componentAdder: (specificComponent?: string) => Promise<void>;
declare const getComponentGitRepo: () => Promise<void>;
declare const initialProviderAdder: (componentFolderPath: string) => Promise<void>;
export { componentAdder, initialProviderAdder, getComponentGitRepo };
