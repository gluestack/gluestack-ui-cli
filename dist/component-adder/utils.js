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
        define(["require", "exports", "child_process", "cli-spinner", "fs-extra", "path", "find-package-json", "simple-git", "util", "prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getConfigComponentPath = exports.installDependencies = exports.checkIfFolderExists = exports.pullComponentRepo = exports.cloneComponentRepo = exports.removeClonedRepo = exports.createFolders = void 0;
    const child_process_1 = require("child_process");
    const cli_spinner_1 = require("cli-spinner");
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const path_1 = __importDefault(require("path"));
    const find_package_json_1 = __importDefault(require("find-package-json"));
    const simple_git_1 = __importDefault(require("simple-git"));
    const util_1 = __importDefault(require("util"));
    const prompts_1 = __importDefault(require("prompts"));
    const stat = util_1.default.promisify(fs_extra_1.default.stat);
    const currDir = process.cwd();
    var f = (0, find_package_json_1.default)(currDir);
    const rootPackageJsonPath = f.next().filename || '';
    const projectRootPath = path_1.default.dirname(rootPackageJsonPath);
    const createFolders = (pathx) => {
        const parts = pathx.split('/');
        let currentPath = '';
        try {
            parts.forEach(part => {
                currentPath += part + '/';
                if (!fs_extra_1.default.existsSync(currentPath)) {
                    fs_extra_1.default.mkdirSync(currentPath);
                }
            });
        }
        catch (error) {
            console.error('\x1b[31m', `Error while creating folder ${currentPath}: ${error.message}`, '\x1b[0m');
        }
    };
    exports.createFolders = createFolders;
    const removeClonedRepo = (sourcePath, repoName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield util_1.default.promisify(child_process_1.exec)(`cd ${sourcePath} && rm -rf ${repoName}`);
        }
        catch (error) {
            console.warn('\x1b[33m', `Error while removing cloned repo ${repoName}: ${error.message}`, '\x1b[0m');
        }
    });
    exports.removeClonedRepo = removeClonedRepo;
    const cloneComponentRepo = (targetPath, gitURL) => __awaiter(void 0, void 0, void 0, function* () {
        const git = (0, simple_git_1.default)();
        const spinner = new cli_spinner_1.Spinner('%s Cloning repository... ');
        spinner.setSpinnerString('|/-\\');
        spinner.start();
        try {
            yield git.clone(gitURL, targetPath);
            spinner.stop(true);
            console.log('\x1b[32m', '\nCloning successful.', '\x1b[0m');
        }
        catch (error) {
            spinner.stop(true);
            console.error('\x1b[31m', '\nCloning failed', '\x1b[0m');
            console.error(error);
        }
    });
    exports.cloneComponentRepo = cloneComponentRepo;
    const tryGitPull = (targetPath) => __awaiter(void 0, void 0, void 0, function* () {
        const git = (0, simple_git_1.default)(targetPath);
        if (fs_extra_1.default.existsSync(targetPath)) {
            try {
                yield git.pull('origin', 'main');
            }
            catch (error) {
                console.error(error);
            }
        }
        else {
            console.error('\x1b[31m', '\nTarget path does not exist', '\x1b[0m');
        }
    });
    const wait = (msec) => new Promise((resolve, _) => {
        setTimeout(resolve, msec);
    });
    const pullComponentRepo = (targetpath) => __awaiter(void 0, void 0, void 0, function* () {
        const spinner = new cli_spinner_1.Spinner('%s Pulling latest changes... ');
        spinner.setSpinnerString('|/-\\');
        spinner.start();
        let retry = 0;
        let success = false;
        while (!success && retry < 3) {
            try {
                yield wait(1000);
                yield tryGitPull(targetpath);
                success = true;
            }
            catch (error) {
                console.error('\x1b[31m', `\nPulling failed - retrying... (Attempt ${retry + 1})\n`, '\x1b[0m', error.message);
                retry++;
            }
        }
        if (!success) {
            spinner.stop();
            console.error('\x1b[31m', '\nPulling failed!\n', '\x1b[0m');
        }
        else {
            spinner.stop();
            console.log('\x1b[32m', '\nGit pull successful.', '\x1b[0m');
        }
    });
    exports.pullComponentRepo = pullComponentRepo;
    const checkIfFolderExists = (path) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const stats = yield stat(path);
            return stats.isDirectory();
        }
        catch (error) {
            console.warn(`Error while checking if folder exists: ${error.message}`);
            return false;
        }
    });
    exports.checkIfFolderExists = checkIfFolderExists;
    const detectLockFile = () => {
        const packageLockPath = path_1.default.join(projectRootPath, 'package-lock.json');
        const yarnLockPath = path_1.default.join(projectRootPath, 'yarn.lock');
        const pnpmLockPath = path_1.default.join(projectRootPath, 'pnpm-lock.yaml');
        if (fs_extra_1.default.existsSync(packageLockPath)) {
            return 'npm';
        }
        else if (fs_extra_1.default.existsSync(yarnLockPath)) {
            return 'yarn';
        }
        else if (fs_extra_1.default.existsSync(pnpmLockPath)) {
            return 'pnpm';
        }
        else {
            return null;
        }
    };
    const promptVersionManager = () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, prompts_1.default)({
            type: 'select',
            name: 'value',
            message: '\nNo lockfile detected. Please select a package manager to install dependencies:',
            choices: [
                { title: 'npm', value: 'npm' },
                { title: 'yarn', value: 'yarn' },
                { title: 'pnpm', value: 'pnpm' },
            ],
        });
        return response.value;
    });
    const installDependencies = () => __awaiter(void 0, void 0, void 0, function* () {
        const spinner = new cli_spinner_1.Spinner('%s Installing dependencies... ');
        spinner.setSpinnerString('|/-\\');
        let versionManager = detectLockFile();
        if (!versionManager) {
            versionManager = yield promptVersionManager();
        }
        else {
            const confirmResponse = yield (0, prompts_1.default)({
                type: 'confirm',
                name: 'value',
                message: `Lockfile detected for ${versionManager}. Continue with ${versionManager} install?`,
                initial: true,
            });
            if (!confirmResponse.value) {
                versionManager = yield promptVersionManager();
            }
        }
        let command;
        switch (versionManager) {
            case 'npm':
                command = 'npm install --legacy-peer-deps';
                break;
            case 'yarn':
                command = 'yarn';
                break;
            case 'pnpm':
                command = 'pnpm install';
                break;
            default:
                throw new Error('Invalid package manager selected');
        }
        try {
            spinner.start();
            (0, child_process_1.spawnSync)(command, {
                cwd: projectRootPath,
                stdio: 'inherit',
                shell: true,
            });
            spinner.stop();
            console.log('\x1b[32m%s\x1b[0m', '\nDependencies have been installed successfully.');
        }
        catch (error) {
            console.error('Error installing dependencies.');
            console.error('\x1b[31m%s\x1b[0m', `Error: Run '${command}' manually!`);
            throw new Error('Error installing dependencies.');
        }
    });
    exports.installDependencies = installDependencies;
    const getConfigComponentPath = () => {
        var _a;
        const configFile = fs_extra_1.default.readFileSync(`${currDir}/gluestack-ui.config.ts`, 'utf-8');
        const match = configFile.match(/componentPath:\s+(['"])(.*?)\1/);
        const componentPath = (_a = (match && match[1])) !== null && _a !== void 0 ? _a : '';
        return componentPath;
    };
    exports.getConfigComponentPath = getConfigComponentPath;
});
