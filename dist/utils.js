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
        define(["require", "exports", "fs-extra", "path", "find-package-json", "child_process", "@clack/prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.dashToPascal = exports.pascalToDash = exports.addIndexFile = exports.installDependencies = exports.getConfigComponentPath = void 0;
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const path_1 = __importDefault(require("path"));
    const find_package_json_1 = __importDefault(require("find-package-json"));
    const child_process_1 = require("child_process");
    const prompts_1 = require("@clack/prompts");
    const currDir = process.cwd();
    var f = (0, find_package_json_1.default)(currDir);
    const rootPackageJsonPath = f.next().filename || '';
    const projectRootPath = path_1.default.dirname(rootPackageJsonPath);
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
        const packageManager = yield (0, prompts_1.select)({
            message: 'No lockfile detected. Please select a package manager to install dependencies:',
            options: [
                { value: 'npm', label: 'npm', hint: 'recommended' },
                { value: 'yarn', label: 'yarn' },
            ],
        });
        if ((0, prompts_1.isCancel)(packageManager)) {
            (0, prompts_1.cancel)('Operation cancelled.');
            process.exit(0);
        }
        return packageManager;
    });
    const installDependencies = () => __awaiter(void 0, void 0, void 0, function* () {
        let versionManager = detectLockFile();
        if (!versionManager) {
            versionManager = yield promptVersionManager();
        }
        else {
            const shouldContinue = yield (0, prompts_1.confirm)({
                message: `Lockfile detected for ${versionManager}. Continue with ${versionManager} install?`,
            });
            if (!shouldContinue) {
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
        const s = (0, prompts_1.spinner)();
        s.start('⏳ Installing dependencies...');
        try {
            (0, child_process_1.spawnSync)(command, {
                cwd: projectRootPath,
                stdio: 'inherit',
                shell: true,
            });
            s.stop(`\x1b[32mDependencies have been installed successfully.\x1b[0m`);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            prompts_1.log.error('\x1b[31mError installing dependencies:\x1b[0m');
            prompts_1.log.warning(` - Run \x1b[33m'${command}'\x1b[0m manually!`);
            throw new Error('Error installing dependencies.');
        }
    });
    exports.installDependencies = installDependencies;
    const getConfigComponentPath = () => {
        var _a;
        const configFile = fs_extra_1.default.readFileSync(`${currDir}/gluestack-ui.config.ts`, 'utf-8');
        const match = configFile.match(/componentPath:\s+(['"])(.*?)\1/);
        const componentPath = (_a = (match && match[2])) !== null && _a !== void 0 ? _a : '';
        return componentPath;
    };
    exports.getConfigComponentPath = getConfigComponentPath;
    const addIndexFile = (componentsDirectory, level = 0) => {
        try {
            const files = fs_extra_1.default.readdirSync(componentsDirectory);
            const exports = files
                .filter(file => file !== 'index.js' && file !== 'index.tsx' && file !== 'index.ts')
                .map(file => {
                if (level === 0) {
                    addIndexFile(`${componentsDirectory}/${file}`, level + 1);
                }
                return `export * from './${file.split('.')[0]}';`;
            })
                .join('\n');
            fs_extra_1.default.writeFileSync(path_1.default.join(componentsDirectory, 'index.ts'), exports);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    };
    exports.addIndexFile = addIndexFile;
    const pascalToDash = (str) => {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    };
    exports.pascalToDash = pascalToDash;
    const dashToPascal = (str) => {
        return str
            .toLowerCase()
            .replace(/-(.)/g, (_, group1) => group1.toUpperCase())
            .replace(/(^|-)([a-z])/g, (_, _group1, group2) => group2.toUpperCase());
    };
    exports.dashToPascal = dashToPascal;
});
