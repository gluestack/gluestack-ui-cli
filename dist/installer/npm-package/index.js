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
        define(["require", "exports", "../utils", "@clack/prompts", "fs-extra", "./data", "path"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.npmPackageInstaller = void 0;
    const utils_1 = require("../utils");
    const prompts_1 = require("@clack/prompts");
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const data_1 = require("./data");
    const path_1 = require("path");
    const npmPackageInstaller = (folderPath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield createIndexFile(folderPath);
            yield addTsConfig();
            (0, utils_1.addDependencies)('Unknown');
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    exports.npmPackageInstaller = npmPackageInstaller;
    const addTsConfig = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (fs_extra_1.default.existsSync((0, path_1.join)(process.cwd() + '/tsconfig.json'))) {
                const setupType = yield isAutoSetup();
                if (setupType === 'No') {
                    return;
                }
            }
            fs_extra_1.default.writeFileSync('tsconfig.json', JSON.stringify({
                compilerOptions: {
                    skipLibCheck: true,
                    target: 'es6',
                    lib: ['es6', 'es2015', 'dom'],
                    declaration: true,
                    outDir: 'build',
                    strict: true,
                    types: ['node'],
                    esModuleInterop: true,
                    module: 'CommonJS',
                    moduleResolution: 'node',
                    allowJs: true,
                    jsx: 'react',
                },
                exclude: ['node_modules'],
                include: ['src'],
            }));
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    const createIndexFile = (folderPath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { indexData } = (0, data_1.getDataFiles)();
            fs_extra_1.default.writeFileSync(`${folderPath}/index.ts`, indexData, 'utf8');
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    const isAutoSetup = () => __awaiter(void 0, void 0, void 0, function* () {
        const setupType = yield (0, prompts_1.select)({
            message: 'You already have a tsconfig.json file in your project. Do you want us to override the existing file ?',
            options: [
                { value: 'Yes', label: 'Yes' },
                { value: 'No', label: 'No' },
            ],
        });
        if ((0, prompts_1.isCancel)(setupType)) {
            (0, prompts_1.cancel)('Operation cancelled.');
            process.exit(0);
        }
        return setupType;
    });
});
