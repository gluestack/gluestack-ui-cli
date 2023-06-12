declare const getDataFiles: (folderName: string, gluestackConfigImportPath: string) => {
    document: string;
    nextConfig: string;
    app: string;
    providerContent: string;
    layoutContent: string;
};
export { getDataFiles };
