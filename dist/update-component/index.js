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
        define(["require", "exports", "fs-extra", "path", "../component-adder", "../utils", "@clack/prompts", "os"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateComponent = void 0;
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const path_1 = __importDefault(require("path"));
    const component_adder_1 = require("../component-adder");
    const utils_1 = require("../utils");
    const prompts_1 = require("@clack/prompts");
    const os_1 = __importDefault(require("os"));
    const homeDir = os_1.default.homedir();
    const getAllComponents = (source) => {
        const requestedComponents = [];
        fs_extra_1.default.readdirSync(source).forEach((component) => {
            if (!(component === 'index.ts' ||
                component === 'index.tsx' ||
                component === 'GluestackUIProvider' ||
                component === 'styled')) {
                const cliComponent = (0, utils_1.pascalToDash)(component);
                requestedComponents.push(cliComponent);
            }
        });
        return requestedComponents;
    };
    const getComponentsList = () => __awaiter(void 0, void 0, void 0, function* () {
        const sourcePath = path_1.default.join(homeDir, '.gluestack', 'cache', 'gluestack-ui', 'example', 'storybook', 'src', 'ui-components');
        return fs_extra_1.default.readdirSync(sourcePath);
    });
    const checkIfComponentIsValid = (component) => __awaiter(void 0, void 0, void 0, function* () {
        const componentList = yield getComponentsList();
        if (componentList.includes(component)) {
            return true;
        }
        return false;
    });
    function updateComponent(component = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const componentPath = (0, utils_1.getConfigComponentPath)();
                const dirPath = path_1.default.resolve(process.cwd(), componentPath, 'core', component);
                if (!(yield checkIfComponentIsValid(component))) {
                    prompts_1.log.error(`\x1b[33mComponent "${component}" not found.\x1b[0m`);
                    process.exit(0);
                }
                if (component === '--all') {
                    const source = path_1.default.resolve(process.cwd(), componentPath, 'core');
                    const requestedComponents = getAllComponents(source);
                    for (const component of requestedComponents) {
                        yield (0, component_adder_1.componentAdder)(component, false, true);
                    }
                }
                else {
                    const shouldContinue = yield (0, prompts_1.confirm)({
                        message: `Are you sure you want to update ${component} ? This will remove all your existing changes and replace them with new.`,
                    });
                    if ((0, prompts_1.isCancel)(shouldContinue)) {
                        (0, prompts_1.cancel)('Operation cancelled.');
                        process.exit(0);
                    }
                    if (shouldContinue) {
                        if (fs_extra_1.default.existsSync(dirPath)) {
                            fs_extra_1.default.rmSync(dirPath, { recursive: true, force: true });
                        }
                        else {
                            prompts_1.log.error(`\x1b[33mComponent "${component}" not found.\x1b[0m`);
                            return;
                        }
                        yield (0, component_adder_1.componentAdder)(component, false, true);
                    }
                    else {
                        prompts_1.log.error(`\x1b[33mThe update of component "${component}" has been canceled.\x1b[0m`);
                    }
                }
            }
            catch (err) {
                prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            }
        });
    }
    exports.updateComponent = updateComponent;
});
