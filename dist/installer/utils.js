var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "fs"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const fs_1 = __importDefault(require("fs"));
    const currDir = process.cwd();
    const addDependencies = (projectType = '') => {
        const packageJsonPath = `${currDir}/package.json`;
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
            console.error(`Error updating package.json file: ${err.message}`);
        }
    };
    exports.default = addDependencies;
});
