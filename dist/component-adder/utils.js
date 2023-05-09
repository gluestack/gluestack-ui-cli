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
        define(["require", "exports", "child_process", "fs-extra", "simple-git", "util", "@clack/prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.checkIfFolderExists = exports.pullComponentRepo = exports.cloneComponentRepo = exports.removeClonedRepo = void 0;
    const child_process_1 = require("child_process");
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const simple_git_1 = __importDefault(require("simple-git"));
    const util_1 = __importDefault(require("util"));
    const prompts_1 = require("@clack/prompts");
    const stat = util_1.default.promisify(fs_extra_1.default.stat);
    // const splitPath = (path: string) => {
    //   const regex = /[\\/]/;
    //   return path.split(regex);
    // }
    // const createFolders = (pathx: string) => {
    //   const parts = splitPath(pathx);
    //   let currentPath = '';
    //   try {
    //     parts.forEach(part => {
    //       currentPath = path.join(currentPath, part);
    //       if (!fs.existsSync(currentPath)) {
    //         fs.mkdirSync(currentPath);
    //       }
    //     });
    //   } catch (err) {
    //     log.error(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
    //   }
    // };
    const removeClonedRepo = (sourcePath, repoName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield util_1.default.promisify(child_process_1.exec)(`cd ${sourcePath} && rm -rf ${repoName}`);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    exports.removeClonedRepo = removeClonedRepo;
    const cloneComponentRepo = (targetPath, gitURL) => __awaiter(void 0, void 0, void 0, function* () {
        const git = (0, simple_git_1.default)();
        const s = (0, prompts_1.spinner)();
        s.start('⏳ Cloning repository...');
        try {
            yield git.clone(gitURL, targetPath);
            s.stop('\x1b[32m' + 'Cloning successful.' + '\x1b[0m');
        }
        catch (err) {
            s.stop('\x1b[31m' + 'Cloning failed' + '\x1b[0m');
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    exports.cloneComponentRepo = cloneComponentRepo;
    const tryGitPull = (targetPath) => __awaiter(void 0, void 0, void 0, function* () {
        const git = (0, simple_git_1.default)(targetPath);
        if (fs_extra_1.default.existsSync(targetPath)) {
            try {
                yield git.pull('origin', 'main');
            }
            catch (err) {
                prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            }
        }
        else {
            prompts_1.log.error('\x1b[31m' + 'Target path does not exist' + '\x1b[0m');
        }
    });
    const wait = (msec) => new Promise((resolve, _) => {
        setTimeout(resolve, msec);
    });
    const pullComponentRepo = (targetpath) => __awaiter(void 0, void 0, void 0, function* () {
        const s = (0, prompts_1.spinner)();
        s.start('⏳ Pulling latest changes...');
        let retry = 0;
        let success = false;
        while (!success && retry < 3) {
            try {
                yield wait(1000);
                yield tryGitPull(targetpath);
                success = true;
            }
            catch (err) {
                prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
                prompts_1.log.error(`\x1b[31mPulling failed - retrying... (Attempt ${retry + 1})\x1b[0m`);
                retry++;
            }
        }
        if (!success) {
            s.stop('\x1b[31m' + 'Pulling failed!' + '\x1b[0m');
        }
        else {
            s.stop('\x1b[32m' + 'Git pull successful.' + '\x1b[0m');
        }
    });
    exports.pullComponentRepo = pullComponentRepo;
    const checkIfFolderExists = (path) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const stats = yield stat(path);
            return stats.isDirectory();
        }
        catch (error) {
            return false;
        }
    });
    exports.checkIfFolderExists = checkIfFolderExists;
});
