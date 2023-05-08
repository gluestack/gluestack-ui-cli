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
        define(["require", "exports", "path", "fs", "./data", "@clack/prompts", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.autoSetup = void 0;
    const path_1 = __importDefault(require("path"));
    const fs_1 = __importDefault(require("fs"));
    const data_1 = require("./data");
    const prompts_1 = require("@clack/prompts");
    const utils_1 = require("../utils");
    const currentDirectory = process.cwd();
    const getDocumentExtension = () => {
        const tsConfigPath = path_1.default.resolve(currentDirectory, 'tsconfig.json');
        return fs_1.default.existsSync(tsConfigPath) ? 'tsx' : 'jsx';
    };
    const updateDocument = (document, fileName, isFollowingSrcDirFlag) => __awaiter(void 0, void 0, void 0, function* () {
        const documentExt = getDocumentExtension();
        const appDirectory = isFollowingSrcDirFlag
            ? path_1.default.join('src', 'pages')
            : 'pages';
        const documentPath = path_1.default.join(appDirectory, `${fileName}.${documentExt}`);
        try {
            const fullPath = path_1.default.resolve(currentDirectory, documentPath);
            fs_1.default.writeFileSync(fullPath, document, 'utf8');
            prompts_1.log.step(`- \x1b[32m${documentPath}\x1b[0m file is updated successfully!`);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    const updateNextConfig = (nextConfig) => __awaiter(void 0, void 0, void 0, function* () {
        const documentPath = path_1.default.resolve(currentDirectory, 'next.config.js');
        try {
            fs_1.default.writeFileSync(documentPath, nextConfig, 'utf8');
            prompts_1.log.step('- ' + '\x1b[32mnext.config.js\x1b[0m' + ' file is updated successfully!');
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    const replaceFiles = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
        const { document, nextConfig, app } = (0, data_1.getDataFiles)(folderName);
        const isFollowingSrcDirFlag = (0, utils_1.isFollowingSrcDir)();
        yield updateDocument(document, '_document', isFollowingSrcDirFlag);
        yield updateDocument(app, '_app', isFollowingSrcDirFlag);
        yield updateNextConfig(nextConfig);
    });
    const autoSetup = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            prompts_1.log.info("Hey there! It looks like we've stumbled upon a \x1b[34mNext.js project\x1b[0m! Would you like to take the express lane and proceed with the automatic setup?");
            prompts_1.log.warning(`👉 Keep in mind that we'll be shaking things up a bit and overwriting a few files, namely

-  next.config.ts
-  _app.tsx
-  _document.tsx

So, it's advisable to save your current changes by committing them before proceeding.`);
            const shouldContinue = yield (0, prompts_1.confirm)({
                message: `Would you like to proceed with the automatic setup?`,
            });
            if ((0, prompts_1.isCancel)(shouldContinue)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
            if (shouldContinue) {
                prompts_1.log.warning('\x1b[33mOverwriting files...\x1b[0m');
                yield replaceFiles(folderName);
            }
            else {
                prompts_1.log.warning(`\x1b[33mExiting without overwriting the files...\x1b[0m`);
                prompts_1.log.step(`Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`);
            }
            return shouldContinue;
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            return '';
        }
    });
    exports.autoSetup = autoSetup;
});
