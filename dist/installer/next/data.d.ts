declare const getDataFiles: (folderName: string, gluestackConfigImportPath: string) => {
    document: string;
    nextConfig: string;
    app: string;
};
export { getDataFiles };
