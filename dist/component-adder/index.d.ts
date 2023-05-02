declare const addIndexFile: (componentsDirectory: string, level?: number) => Promise<void>;
declare const componentAdder: (requestedComponent?: string, showWarning?: boolean, isUpdate?: boolean) => Promise<void>;
declare const getComponentGitRepo: () => Promise<void>;
declare const initialProviderAdder: (componentFolderPath: string) => Promise<void>;
export { componentAdder, initialProviderAdder, getComponentGitRepo, addIndexFile, };