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
        define(["require", "exports", "fs-extra", "path", "prompts", "../component-adder/utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.removeComponent = void 0;
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const path_1 = __importDefault(require("path"));
    const prompts_1 = __importDefault(require("prompts"));
    const utils_1 = require("../component-adder/utils");
    const currDir = process.cwd();
    const getAllComponents = (source) => {
        const requestedComponents = [];
        fs_extra_1.default.readdirSync(source).forEach((component) => {
            if (!(component === 'index.ts' ||
                component === 'index.tsx' ||
                component === 'GluestackUIProvider' ||
                component === 'styled')) {
                // const cliComponent = pascalToDash(component);
                requestedComponents.push(component);
            }
        });
        return requestedComponents;
    };
    const addIndexFile = (componentsDirectory, level = 0) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            fs_extra_1.default.readdir(componentsDirectory, (err, files) => {
                if (err) {
                    console.error('\x1b[31m%s\x1b[0m', err.message);
                    throw err;
                }
                const exports = files
                    .filter(file => file !== 'index.js' && file !== 'index.tsx' && file !== 'index.ts')
                    .map(file => {
                    return `export * from './${file.split('.')[0]}';`;
                })
                    .join('\n');
                fs_extra_1.default.writeFile(path_1.default.join(componentsDirectory, 'index.ts'), exports, (err) => {
                    if (err) {
                        console.error('\x1b[31m%s\x1b[0m', err.message);
                        throw err;
                    }
                });
            });
        }
        catch (error) {
            console.error('\x1b[31m%s\x1b[0m', `Error: ${error.message}`);
        }
    });
    const updateIndexFile = (dirPath, componentPath) => __awaiter(void 0, void 0, void 0, function* () {
        const indexPath = path_1.default.resolve(dirPath, 'index.ts');
        fs_extra_1.default.rmSync(indexPath);
        const targetPath = path_1.default.join(currDir, componentPath, 'core');
        addIndexFile(targetPath);
    });
    function removeComponent(component = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const componentPath = (0, utils_1.getConfigComponentPath)();
                const dirPath = path_1.default.resolve(currDir, componentPath, 'core');
                const componentsPath = path_1.default.resolve(currDir, componentPath, 'core', component);
                if (component === '--all') {
                    const requestedComponents = getAllComponents(dirPath);
                    for (const component of requestedComponents) {
                        const componentsPath = path_1.default.resolve(currDir, componentPath, 'core', component);
                        fs_extra_1.default.rmSync(componentsPath, { recursive: true, force: true });
                        console.log(` \x1b[32m ✔  ${'\u001b[1m' +
                            component +
                            '\u001b[22m'} \x1b[0m component removed successfully!`);
                    }
                    //  Update index file
                    yield updateIndexFile(dirPath, componentPath);
                }
                else {
                    const proceedResponse = yield (0, prompts_1.default)({
                        type: 'text',
                        name: 'proceed',
                        message: `Are you sure you want to remove ${component}?`,
                        initial: 'y',
                    });
                    if (proceedResponse.proceed.toLowerCase() === 'y') {
                        if (fs_extra_1.default.existsSync(dirPath)) {
                            fs_extra_1.default.rmSync(componentsPath, { recursive: true, force: true });
                            console.log(` \x1b[32m ✔  ${'\u001b[1m' +
                                component +
                                '\u001b[22m'} \x1b[0m component removed successfully!`);
                            //  Update index file
                            yield updateIndexFile(dirPath, componentPath);
                        }
                        else {
                            console.log('\x1b[33m%s\x1b[0m', `Component "${component}" not found.`);
                        }
                    }
                    else {
                        console.log('\x1b[31m%s\x1b[0m', `The removal of component "${component}" has been canceled.`);
                    }
                }
            }
            catch (err) {
                console.error(`Error removing component: ${err.message}`);
            }
        });
    }
    exports.removeComponent = removeComponent;
});
