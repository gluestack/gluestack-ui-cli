var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "prompts", "path", "fs", "./data"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autoSetup = void 0;
    const prompts_1 = __importDefault(require("prompts"));
    const path_1 = __importDefault(require("path"));
    const fs_1 = __importDefault(require("fs"));
    const data_1 = require("./data");
    const currentDirectory = process.cwd();
    const getDocumentExtension = () => {
        const tsConfigPath = path_1.default.resolve(`${currentDirectory}/tsconfig.json`);
        return fs_1.default.existsSync(tsConfigPath) ? 'tsx' : 'jsx';
    };
    const updateDocument = (document) => __awaiter(void 0, void 0, void 0, function* () {
        const documentExt = getDocumentExtension();
        const documentPath = path_1.default.resolve(`${currentDirectory}/pages/_document.${documentExt}`);
        try {
            fs_1.default.writeFileSync(documentPath, document, 'utf8');
            console.log('\x1b[32m', `- pages/_document.${documentExt} file is updated successfully!`);
        }
        catch (err) {
            console.error('\x1b[31m', `Error updating pages/_document.${documentExt} file: ${err.message}`);
        }
    });
    const updateNextConfig = (nextConfig) => __awaiter(void 0, void 0, void 0, function* () {
        const documentPath = path_1.default.resolve(`${currentDirectory}/next.config.js`);
        try {
            fs_1.default.writeFileSync(documentPath, nextConfig, 'utf8');
            console.log('\x1b[32m', `- next.config.js file is updated successfully!`);
        }
        catch (err) {
            console.error('\x1b[31m', `Error updating next.config.js file: ${err.message}`);
        }
    });
    const updateApp = (app) => __awaiter(void 0, void 0, void 0, function* () {
        const documentExt = getDocumentExtension();
        const documentPath = path_1.default.resolve(`${currentDirectory}/pages/_app.${documentExt}`);
        try {
            fs_1.default.writeFileSync(documentPath, app, 'utf8');
            console.log('\x1b[32m', `- pages/_app.${documentExt} file is updated successfully!`);
        }
        catch (err) {
            console.error('\x1b[31m', `Error updating pages/_app.${documentExt} file: ${err.message}`);
        }
    });
    const replaceFiles = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
        const { document, nextConfig, app } = (0, data_1.getDataFiles)(folderName);
        yield updateDocument(document);
        yield updateApp(app);
        yield updateNextConfig(nextConfig);
    });
    const autoSetup = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const proceedResponse = yield (0, prompts_1.default)({
                type: 'text',
                name: 'proceed',
                message: `We detected that this is a Next.js project. Would you like to proceed with automatic setup? This is recommended for new projects.\nPlease note that the following files will be overwritten:\n- next.config.ts\n- _app.tsx\n- _document.tsx\n\nIt's recommended to commit your current changes before proceeding.\n\nTo proceed and overwrite the files, type 'y'. To cancel and exit, type 'n'.`,
                initial: 'y',
            });
            if (proceedResponse.proceed.toLowerCase() === 'y') {
                console.log('\x1b[33m%s\x1b[0m', '\nOverwriting files...');
                yield replaceFiles(folderName);
            }
            else if (proceedResponse.answer === 'n') {
                console.log('\x1b[33m%s\x1b[0m', 'Exiting without overwriting the files...');
                console.log(`Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`);
            }
            return proceedResponse.proceed.toLowerCase();
        }
        catch (err) {
            console.error('\x1b[31m%s\x1b[0m', `Error in autoSetup: ${err.message}`);
            return '';
        }
    });
    exports.autoSetup = autoSetup;
});
