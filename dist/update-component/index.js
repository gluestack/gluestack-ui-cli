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
        define(["require", "exports", "fs-extra", "path", "prompts", "../component-adder"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.updateComponent = void 0;
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const path_1 = __importDefault(require("path"));
    const prompts_1 = __importDefault(require("prompts"));
    const component_adder_1 = require("../component-adder");
    const pascalToDash = (str) => {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    };
    const getAllComponents = (source) => {
        const requestedComponents = [];
        fs_extra_1.default.readdirSync(source).forEach((component) => {
            if (!(component === 'index.ts' ||
                component === 'index.tsx' ||
                component === 'GluestackUIProvider' ||
                component === 'styled')) {
                const cliComponent = pascalToDash(component);
                requestedComponents.push(cliComponent);
            }
        });
        return requestedComponents;
    };
    function updateComponent(component = '') {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configFile = fs_extra_1.default.readFileSync(`${process.cwd()}/gluestack-ui.config.ts`, 'utf-8');
                const match = configFile.match(/componentPath:\s+'([^']+)'/);
                const componentPath = (match && match[1]) || '';
                const dirPath = path_1.default.resolve(process.cwd(), componentPath, 'core', component);
                if (component === '--all') {
                    const source = path_1.default.resolve(process.cwd(), componentPath, 'core');
                    const requestedComponents = getAllComponents(source);
                    for (const component of requestedComponents) {
                        yield (0, component_adder_1.componentAdder)(component, false, true);
                    }
                }
                else {
                    const proceedResponse = yield (0, prompts_1.default)({
                        type: 'text',
                        name: 'proceed',
                        message: `Are you sure you want to update ${component} ? This will remove all your existing changes and replace them with new (y/n)`,
                        initial: 'y',
                    });
                    if (proceedResponse.proceed === 'y') {
                        if (fs_extra_1.default.existsSync(dirPath)) {
                            fs_extra_1.default.rmSync(dirPath, { recursive: true, force: true });
                        }
                        else {
                            console.log(`\x1b[31mError: Component '${component}' not found.\x1b[0m`);
                            return;
                        }
                        yield (0, component_adder_1.componentAdder)(component, false, true);
                    }
                    else {
                        console.log(`\x1b[33mUpdate of the component '${component}' has been cancelled.\x1b[0m`);
                    }
                }
            }
            catch (err) {
                console.log('\x1b[31m%s\x1b[0m', 'Error updating components:', err.message);
            }
        });
    }
    exports.updateComponent = updateComponent;
});
