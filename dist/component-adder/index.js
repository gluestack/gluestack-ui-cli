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
        define(["require", "exports", "fs-extra", "path", "process", "util", "os", "./utils", "../utils", "@clack/prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getComponentGitRepo = exports.initialProviderAdder = exports.componentAdder = void 0;
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const path_1 = __importDefault(require("path"));
    const process_1 = __importDefault(require("process"));
    const util_1 = __importDefault(require("util"));
    const os_1 = __importDefault(require("os"));
    const utils_1 = require("./utils");
    const utils_2 = require("../utils");
    const prompts_1 = require("@clack/prompts");
    const homeDir = os_1.default.homedir();
    const currDir = process_1.default.cwd();
    const copyAsync = util_1.default.promisify(fs_extra_1.default.copy);
    let existingComponentsChecked = false;
    const copyFolders = (sourcePath, targetPath, specificComponent, isUpdate) => __awaiter(void 0, void 0, void 0, function* () {
        const groupedComponents = {};
        let specificComponentType;
        //  Traverse all components
        try {
            fs_extra_1.default.readdirSync(sourcePath).forEach((component) => {
                if (component !== 'index.ts' &&
                    component !== 'index.tsx' &&
                    component !== 'Provider') {
                    // Read in the existing package.json file
                    const packageJsonPath = path_1.default.join(sourcePath, component, "config.json");
                    const packageJson = JSON.parse(fs_extra_1.default.readFileSync(packageJsonPath, 'utf8'));
                    let componentType;
                    if (packageJson.keywords.indexOf('components') !== -1) {
                        componentType = packageJson.keywords[1];
                    }
                    if (componentType) {
                        const cliComponent = (0, utils_2.pascalToDash)(component);
                        groupedComponents[componentType] =
                            groupedComponents[componentType] || [];
                        groupedComponents[componentType].push(cliComponent);
                    }
                    const sourceComponent = (0, utils_2.pascalToDash)(component);
                    if (sourceComponent.toLowerCase() === specificComponent.toLowerCase()) {
                        specificComponentType = componentType;
                    }
                }
            });
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            return;
        }
        let selectedComponents = {};
        // Ask component type
        if (!specificComponentType) {
            const selectedComponentType = yield (0, prompts_1.multiselect)({
                message: 'Select the type of components:',
                options: Object.keys(groupedComponents).map(type => {
                    return { value: type, label: type };
                }),
                required: true,
            });
            if ((0, prompts_1.isCancel)(selectedComponentType)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process_1.default.exit(0);
            }
            if (Array.isArray(selectedComponentType)) {
                yield Promise.all(selectedComponentType.map((component) => __awaiter(void 0, void 0, void 0, function* () {
                    if (groupedComponents[component].length !== 0) {
                        const selectComponents = yield (0, prompts_1.multiselect)({
                            message: `Select ${component} components:`,
                            options: groupedComponents[component].map(type => {
                                return { value: type, label: type };
                            }),
                            required: true,
                        });
                        if ((0, prompts_1.isCancel)(selectComponents)) {
                            (0, prompts_1.cancel)('Operation cancelled.');
                            process_1.default.exit(0);
                        }
                        selectedComponents[component] = selectComponents;
                    }
                    else {
                        prompts_1.log.error(`\x1b[31mError: No components of ${component} type!\x1b[0m`);
                    }
                })));
            }
        }
        else {
            selectedComponents[specificComponentType] = [specificComponent];
        }
        yield Promise.all(Object.keys(selectedComponents).map(component => {
            (0, utils_1.createFolders)(path_1.default.join(targetPath, component));
            selectedComponents[component].map((subcomponent) => {
                // Add Packages
                const originalComponentPath = (0, utils_2.dashToPascal)(subcomponent);
                const compPackageJsonPath = path_1.default.join(sourcePath, originalComponentPath, "config.json");
                const compPackageJson = JSON.parse(fs_extra_1.default.readFileSync(compPackageJsonPath, 'utf8'));
                if (compPackageJson.componentDependencies &&
                    compPackageJson.componentDependencies.length > 0) {
                    compPackageJson.componentDependencies.map((component) => __awaiter(void 0, void 0, void 0, function* () {
                        yield componentAdder(component, false, true);
                    }));
                }
                const rootPackageJsonPath = path_1.default.join(currDir, "package.json");
                const rootPackageJson = JSON.parse(fs_extra_1.default.readFileSync(rootPackageJsonPath, 'utf8'));
                rootPackageJson.dependencies = Object.assign(Object.assign({}, rootPackageJson.dependencies), compPackageJson.dependencies);
                fs_extra_1.default.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
                (0, utils_1.createFolders)(path_1.default.join(targetPath, component, originalComponentPath));
                fs_extra_1.default.copySync(path_1.default.join(sourcePath, originalComponentPath), path_1.default.join(targetPath, component, originalComponentPath));
                if (fs_extra_1.default.existsSync(path_1.default.join(targetPath, component, originalComponentPath, "config.json"))) {
                    fs_extra_1.default.unlinkSync(path_1.default.join(targetPath, component, originalComponentPath, "config.json"));
                }
                if (!isUpdate) {
                    prompts_1.log.success(`\x1b[32m✅  ${'\u001b[1m' +
                        originalComponentPath +
                        '\u001b[22m'} \x1b[0m component added successfully!`);
                }
                else {
                    prompts_1.log.success(`\x1b[32m✅  ${'\u001b[1m' +
                        originalComponentPath +
                        '\u001b[22m'} \x1b[0m component updated successfully!`);
                }
            });
        }));
    });
    const checkForExistingFolders = (specificComponents) => __awaiter(void 0, void 0, void 0, function* () {
        const alreadyExistingComponents = [];
        let selectedComponents = [];
        for (const component of specificComponents) {
            const componentPath = (0, utils_2.getConfigComponentPath)();
            const pathToCheck = path_1.default.join(currDir, componentPath, 'core', (0, utils_2.dashToPascal)(component));
            if (fs_extra_1.default.existsSync(pathToCheck)) {
                alreadyExistingComponents.push(component);
            }
        }
        if (alreadyExistingComponents.length === 1) {
            const shouldContinue = yield (0, prompts_1.confirm)({
                message: `The ${alreadyExistingComponents[0]} component already exists. Kindly proceed if you wish to replace. Be advised that if there are any interdependent components, proceeding will result in their dependent components being replaced as well.`,
            });
            if ((0, prompts_1.isCancel)(shouldContinue)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process_1.default.exit(0);
            }
            if (shouldContinue) {
                selectedComponents = alreadyExistingComponents;
            }
        }
        else if (alreadyExistingComponents.length > 0) {
            selectedComponents = yield (0, prompts_1.multiselect)({
                message: `The following components already exists. Kindly choose the ones you wish to replace. Be advised that if there are any interdependent components, selecting them for replacement will result in their dependent components being replaced as well.`,
                options: alreadyExistingComponents.map(component => ({
                    label: component,
                    value: component,
                })),
            });
            if ((0, prompts_1.isCancel)(selectedComponents)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process_1.default.exit(0);
            }
        }
        // Remove repeated components from all components
        const filteredComponents = specificComponents.filter(component => !alreadyExistingComponents.includes(component));
        // Add selected components to all components
        const updatedComponents = filteredComponents.concat(selectedComponents);
        existingComponentsChecked = true;
        return updatedComponents;
    });
    const getAllComponents = (source) => {
        const requestedComponents = [];
        fs_extra_1.default.readdirSync(source).forEach((component) => {
            if (!(component === 'index.ts' ||
                component === 'index.tsx' ||
                component === 'Provider')) {
                const packageJsonPath = path_1.default.join(source, component, "config.json");
                const packageJson = JSON.parse(fs_extra_1.default.readFileSync(packageJsonPath, 'utf8'));
                let componentType;
                if (packageJson.keywords.indexOf('components') !== -1) {
                    componentType = packageJson.keywords[1];
                }
                if (componentType) {
                    const cliComponent = (0, utils_2.pascalToDash)(component);
                    requestedComponents.push(cliComponent);
                }
            }
        });
        return requestedComponents;
    };
    const componentAdder = (requestedComponent = '', showWarning = true, isUpdate = false) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get config
            const sourcePath = path_1.default.join(homeDir, ".gluestack", "cache", "gluestack-ui", "example", "storybook", "src", "ui-components");
            let requestedComponents = [];
            let addComponents = [];
            if (requestedComponent === '--all') {
                requestedComponents = getAllComponents(sourcePath);
            }
            else {
                requestedComponents.push(requestedComponent);
            }
            if (!existingComponentsChecked &&
                showWarning &&
                requestedComponent !== '') {
                const updatedComponents = yield checkForExistingFolders(requestedComponents);
                addComponents = [...updatedComponents];
            }
            else {
                addComponents = requestedComponents;
            }
            yield Promise.all(addComponents.map((component) => __awaiter(void 0, void 0, void 0, function* () {
                const componentPath = (0, utils_2.getConfigComponentPath)();
                (0, utils_1.createFolders)(path_1.default.join(currDir, componentPath));
                const targetPath = path_1.default.join(currDir, componentPath);
                yield copyFolders(sourcePath, targetPath, component, isUpdate);
                (0, utils_2.addIndexFile)(targetPath);
            })));
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    exports.componentAdder = componentAdder;
    const splitPath = (path) => {
        const regex = /[\\/]/;
        return path.split(regex);
    };
    const addProvider = (sourcePath, targetPath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Create necessary folders
            (0, utils_1.createFolders)(path_1.default.join(targetPath, "core"));
            (0, utils_1.createFolders)(path_1.default.join(targetPath, "core", "GluestackUIProvider"));
            (0, utils_1.createFolders)(path_1.default.join(targetPath, "core", "styled"));
            // Copy Provider and styled folder
            yield copyAsync(path_1.default.join(sourcePath, "Provider"), path_1.default.join(targetPath, "core", "GluestackUIProvider"));
            yield copyAsync(path_1.default.join(sourcePath, "styled"), path_1.default.join(targetPath, "core", "styled"));
            // Copy Gluestack UI config to root
            const gluestackConfig = yield fs_extra_1.default.readFile(path_1.default.resolve(sourcePath, '../', 'gluestack-ui.config.ts'), 'utf8');
            yield fs_extra_1.default.writeFile(path_1.default.join(currDir, "gluestack-ui.config.ts"), gluestackConfig);
            // Delete config.json files
            fs_extra_1.default.unlinkSync(path_1.default.join(targetPath, "core", "GluestackUIProvider", "config.json"));
            fs_extra_1.default.unlinkSync(path_1.default.join(targetPath, "core", "styled", "config.json"));
            // Update Provider Config Path
            const providerIndexFile = yield fs_extra_1.default.readFile(path_1.default.join(targetPath, "core", "GluestackUIProvider", "index.tsx"), 'utf8');
            const modifiedProviderIndexFile = providerIndexFile.replace('./gluestack-ui.config', path_1.default
                .relative(path_1.default.join(targetPath, "core", "GluestackUIProvider", "index.tsx"), path_1.default.join(currDir, "gluestack-ui.config"))
                .slice(3));
            fs_extra_1.default.writeFileSync(path_1.default.join(targetPath, "core", "GluestackUIProvider", "index.tsx"), modifiedProviderIndexFile);
            // Update Gluestack UI config file
            const configFile = yield fs_extra_1.default.readFile(path_1.default.join(currDir, "gluestack-ui.config.ts"), 'utf8');
            const folderName = splitPath(targetPath).slice(-1)[0];
            const newConfig = configFile.replace(/componentPath:\s+'[^']+'/, `componentPath: './${folderName}'`);
            fs_extra_1.default.writeFileSync(path_1.default.join(currDir, "gluestack-ui.config.ts"), newConfig);
            prompts_1.log.success(`\x1b[32m✅  ${'\u001b[1m' +
                'GluestackUIProvider' +
                '\u001b[22m'} \x1b[0m added successfully!`);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    const getComponentGitRepo = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Clone repo locally in users home directory
            const cloneLocation = path_1.default.join(homeDir, ".gluestack", "cache");
            const clonedPath = path_1.default.join(cloneLocation, "gluestack-ui");
            const clonedRepoExists = yield (0, utils_1.checkIfFolderExists)(clonedPath);
            if (clonedRepoExists) {
                prompts_1.log.step('Repository already cloned.');
                yield (0, utils_1.pullComponentRepo)(clonedPath);
            }
            else {
                const s = (0, prompts_1.spinner)();
                s.start('Cloning repository...');
                (0, utils_1.createFolders)(cloneLocation);
                yield (0, utils_1.cloneComponentRepo)(clonedPath, 'https://github.com/gluestack/gluestack-ui.git');
                s.stop('Repository cloned successfully.');
            }
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    exports.getComponentGitRepo = getComponentGitRepo;
    const initialProviderAdder = (componentFolderPath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            (0, utils_1.createFolders)(path_1.default.join(currDir, componentFolderPath));
            const sourcePath = path_1.default.join(homeDir, "\.gluestack", "cache", "gluestack-ui", "example", "storybook", "src", "ui-components");
            const targetPath = path_1.default.join(currDir, componentFolderPath);
            yield addProvider(sourcePath, targetPath);
            (0, utils_2.addIndexFile)(targetPath);
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
        }
    });
    exports.initialProviderAdder = initialProviderAdder;
});
