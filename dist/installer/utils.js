var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs", "@clack/prompts", "../utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mergePaths = exports.isStartingWithSrc = exports.isFollowingSrcDir = exports.addDependencies = void 0;
    const fs_1 = __importDefault(require("fs"));
    const prompts_1 = require("@clack/prompts");
    const utils_1 = require("../utils");
    const currDir = process.cwd();
    const rootPackageJsonPath = (0, utils_1.getPackageJsonPath)();
    const addDependencies = (projectType = '') => {
        const packageJsonPath = rootPackageJsonPath;
        try {
            // Read in the existing package.json file
            const packageJson = JSON.parse(fs_1.default.readFileSync(packageJsonPath, 'utf8'));
            // Add a new dependency to the package.json file
            packageJson.dependencies = packageJson.dependencies || {};
            packageJson.dependencies['@dank-style/react'] = 'latest';
            packageJson.dependencies['@gluestack-ui/provider'] = 'latest';
            packageJson.dependencies['@dank-style/animation-plugin'] = 'latest';
            if (projectType === 'Next') {
                packageJson.dependencies['@gluestack/ui-next-adapter'] = 'latest';
            }
            // Add a new devDependency to the package.json file
            packageJson.devDependencies = packageJson.devDependencies || {};
            packageJson.devDependencies['react-native-web'] = '^0.18.12';
            packageJson.devDependencies['react-native'] = '^0.70.7';
            packageJson.devDependencies['@types/react-native'] = '^0.71.6';
            // Write the updated package.json file
            fs_1.default.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    };
    exports.addDependencies = addDependencies;
    function isStartingWithSrc(input) {
        return input.startsWith('./src') || input.startsWith('src');
    }
    exports.isStartingWithSrc = isStartingWithSrc;
    function mergePaths(str1, str2) {
        if (str1.startsWith('./')) {
            str1 = str1.slice(2);
        }
        if (str2.endsWith('/')) {
            str2 = str2.slice(0, -1);
        }
        return `${str2}/${str1}`;
    }
    exports.mergePaths = mergePaths;
    const isFollowingSrcDir = () => {
        try {
            const files = fs_1.default.readdirSync(currDir);
            if (files.includes('src') && fs_1.default.statSync(`${currDir}/src`).isDirectory()) {
                return true;
            }
        }
        catch (error) {
            console.error(error);
        }
        return false;
    };
    exports.isFollowingSrcDir = isFollowingSrcDir;
});
