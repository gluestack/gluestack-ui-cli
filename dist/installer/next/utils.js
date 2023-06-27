var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    const path_1 = __importStar(require("path"));
    const fs_1 = __importDefault(require("fs"));
    const data_1 = require("./data");
    const prompts_1 = require("@clack/prompts");
    const utils_1 = require("../utils");
    const currentDirectory = process.cwd();
    const getDocumentExtension = () => {
        const tsConfigPath = path_1.default.resolve(currentDirectory, 'tsconfig.json');
        return fs_1.default.existsSync(tsConfigPath) ? 'tsx' : 'jsx';
    };
    const updateDocument = (document, filePath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const fullPath = path_1.default.resolve(currentDirectory, filePath);
            fs_1.default.writeFileSync(fullPath, document, 'utf8');
            prompts_1.log.step(`- \x1b[32m${filePath}\x1b[0m file is updated successfully!`);
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
    function convertToValidString(input) {
        // Replace all occurrences of backslashes with forward slashes
        const output = input.replace(/\\/g, '/');
        return output;
    }
    const replaceFiles = (folderName, packageName) => __awaiter(void 0, void 0, void 0, function* () {
        const isAppDir = (0, utils_1.isFollowingAppDir)();
        const appPath = getAppPath();
        const isFollowingSrcDirFlag = (0, utils_1.isFollowingSrcDir)();
        const appDirectory = isFollowingSrcDirFlag
            ? path_1.default.join('src', 'pages')
            : 'pages';
        const gluestackConfigImportPath = convertToValidString(path_1.default.relative(appDirectory, currentDirectory));
        const documentExt = getDocumentExtension();
        const { document, nextConfig, app, providerContent, layoutContent, } = (0, data_1.getDataFiles)(folderName, gluestackConfigImportPath, packageName);
        if (isAppDir) {
            yield createProvidersFile(appPath, providerContent);
            yield updateDocument(layoutContent, path_1.default.join(appPath, 'layout.tsx'));
        }
        else {
            yield updateDocument(document, path_1.default.join(appDirectory, `_document.${documentExt}`));
            yield updateDocument(app, path_1.default.join(appDirectory, `_app.${documentExt}`));
        }
        yield updateNextConfig(nextConfig);
    });
    const createProvidersFile = (providersPath, providerContent) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            fs_1.default.writeFileSync(path_1.default.join(providersPath, 'providers.tsx'), providerContent, 'utf8');
            prompts_1.log.step(`- \x1b[32m${providersPath}\x1b[0m file is created successfully!`);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    const getAppPath = () => {
        const appPath = (0, path_1.join)(process.cwd(), 'app');
        const files = fs_1.default.readdirSync(process.cwd());
        if (files.includes('app') && fs_1.default.statSync(appPath).isDirectory()) {
            return appPath;
        }
        else {
            if (files.includes('src') &&
                fs_1.default.statSync((0, path_1.join)(process.cwd(), 'src/app')).isDirectory()) {
                return (0, path_1.join)(process.cwd(), 'src/app');
            }
        }
        return appPath;
    };
    const autoSetup = (folderName, packageName) => __awaiter(void 0, void 0, void 0, function* () {
        const isAppDir = (0, utils_1.isFollowingAppDir)();
        try {
            prompts_1.log.info("Hey there! It looks like we've stumbled upon a \x1b[34mNext.js project\x1b[0m! Would you like to take the express lane and proceed with the automatic setup?");
            if (isAppDir) {
                prompts_1.log.warning(`👉 Keep in mind that we'll be shaking things up a bit and overwriting a few files, namely

        -  next.config.ts
        -  app/layout.tsx
         So, it's advisable to save your current changes by committing them before proceeding.`);
            }
            else
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
                yield replaceFiles(folderName, packageName);
                if (isAppDir) {
                    prompts_1.log.step(`Just add 'use client' derivative at the top of your pages and you're good to go!`);
                    prompts_1.log.step(`You can now directly use gluestack-ui components in your app! 🎉`);
                }
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
