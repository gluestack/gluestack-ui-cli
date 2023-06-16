declare const componentAdder: (requestedComponent?: string, showWarning?: boolean, isUpdate?: boolean) => Promise<void>;
declare const getComponentGitRepo: () => Promise<void>;
declare const initialProviderAdder: (componentFolderPath: string, projectType: string) => Promise<void>;
export { componentAdder, initialProviderAdder, getComponentGitRepo };
