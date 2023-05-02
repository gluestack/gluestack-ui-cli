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
        define(["require", "exports", "fs-extra", "prompts", "path", "process", "util", "os", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getComponentGitRepo = exports.initialProviderAdder = exports.componentAdder = void 0;
    const fs_extra_1 = __importDefault(require("fs-extra"));
    const prompts_1 = __importDefault(require("prompts"));
    const path_1 = __importDefault(require("path"));
    const process_1 = __importDefault(require("process"));
    const util_1 = __importDefault(require("util"));
    const os_1 = __importDefault(require("os"));
    const utils_1 = require("./utils");
    const homeDir = os_1.default.homedir();
    const currDir = process_1.default.cwd();
    const copyAsync = util_1.default.promisify(fs_extra_1.default.copy);
    let existingComponentsChecked = false;
    let componentsToBeAdded = [];
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
                    if (level === 0) {
                        addIndexFile(`${componentsDirectory}/${file}`, level + 1);
                    }
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
    const pascalToDash = (str) => {
        return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
    };
    const dashToPascal = (str) => {
        return str
            .toLowerCase()
            .replace(/-(.)/g, (_, group1) => group1.toUpperCase())
            .replace(/(^|-)([a-z])/g, (_, _group1, group2) => group2.toUpperCase());
    };
    const copyFolders = (sourcePath, targetPath, specificComponent) => __awaiter(void 0, void 0, void 0, function* () {
        const groupedComponents = {};
        let specificComponentType;
        //  Traverse all components
        try {
            fs_extra_1.default.readdirSync(sourcePath).forEach((component) => {
                if (component !== 'index.ts' &&
                    component !== 'index.tsx' &&
                    component !== 'Provider') {
                    // Read in the existing package.json file
                    const packageJsonPath = `${sourcePath}/${component}/config.json`;
                    const packageJson = JSON.parse(fs_extra_1.default.readFileSync(packageJsonPath, 'utf8'));
                    let componentType;
                    if (packageJson.keywords.indexOf('components') !== -1) {
                        componentType = packageJson.keywords[1];
                    }
                    if (componentType) {
                        const cliComponent = pascalToDash(component);
                        groupedComponents[componentType] =
                            groupedComponents[componentType] || [];
                        groupedComponents[componentType].push(cliComponent);
                    }
                    const sourceComponent = pascalToDash(component);
                    if (sourceComponent.toLowerCase() === specificComponent.toLowerCase()) {
                        specificComponentType = componentType;
                    }
                }
            });
        }
        catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `Error occurred while reading config files: ${error.message}`);
            return;
        }
        let selectedComponents = {};
        // Ask component type
        if (!specificComponentType) {
            const selectedComponentType = yield (0, prompts_1.default)({
                type: 'multiselect',
                name: 'componentType',
                message: `Select the type of components:`,
                choices: Object.keys(groupedComponents).map(type => {
                    return { title: type, value: type };
                }),
            });
            if (selectedComponentType.componentType) {
                yield Promise.all(selectedComponentType.componentType.map((component) => __awaiter(void 0, void 0, void 0, function* () {
                    if (groupedComponents[component].length !== 0) {
                        const selectComponents = yield (0, prompts_1.default)({
                            type: 'multiselect',
                            name: 'components',
                            message: `Select ${component} components:`,
                            choices: groupedComponents[component].map(type => {
                                return { title: type, value: type };
                            }),
                        });
                        selectedComponents[component] = selectComponents.components;
                    }
                    else {
                        console.log(`No components of ${component} type!`);
                    }
                })));
            }
        }
        else {
            selectedComponents[specificComponentType] = [specificComponent];
        }
        yield Promise.all(Object.keys(selectedComponents).map(component => {
            (0, utils_1.createFolders)(`${targetPath}/${component}`);
            selectedComponents[component].map(subcomponent => {
                // Add Packages
                const originalComponentPath = dashToPascal(subcomponent);
                const compPackageJsonPath = `${sourcePath}/${originalComponentPath}/config.json`;
                const compPackageJson = JSON.parse(fs_extra_1.default.readFileSync(compPackageJsonPath, 'utf8'));
                if (compPackageJson.componentDependencies &&
                    compPackageJson.componentDependencies.length > 0) {
                    compPackageJson.componentDependencies.map((component) => __awaiter(void 0, void 0, void 0, function* () {
                        yield componentAdder(component);
                    }));
                }
                const rootPackageJsonPath = `${currDir}/package.json`;
                const rootPackageJson = JSON.parse(fs_extra_1.default.readFileSync(rootPackageJsonPath, 'utf8'));
                rootPackageJson.dependencies = Object.assign(Object.assign({}, rootPackageJson.dependencies), compPackageJson.dependencies);
                fs_extra_1.default.writeFileSync(rootPackageJsonPath, JSON.stringify(rootPackageJson, null, 2));
                (0, utils_1.createFolders)(`${targetPath}/${component}/${originalComponentPath}`);
                fs_extra_1.default.copySync(`${sourcePath}/${originalComponentPath}`, `${targetPath}/${component}/${originalComponentPath}`);
                if (fs_extra_1.default.existsSync(`${targetPath}/${component}/${originalComponentPath}/config.json`)) {
                    fs_extra_1.default.unlinkSync(`${targetPath}/${component}/${originalComponentPath}/config.json`);
                }
                console.log(` \x1b[32m ✔  ${'\u001b[1m' +
                    originalComponentPath +
                    '\u001b[22m'} \x1b[0m component added successfully!`);
            });
        }));
    });
    const checkForExistingFolders = (specificComponents) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const alreadyExistingComponents = [];
        let selectedComponents = [];
        for (const component of specificComponents) {
            const configFile = fs_extra_1.default.readFileSync(`${currDir}/gluestack-ui.config.ts`, 'utf-8');
            const match = configFile.match(/componentPath:\s+'([^']+)'/);
            const componentPath = (_a = (match && match[1])) !== null && _a !== void 0 ? _a : '';
            const pathToCheck = path_1.default.join(currDir, componentPath, 'core', dashToPascal(component));
            if (fs_extra_1.default.existsSync(pathToCheck)) {
                alreadyExistingComponents.push(component);
            }
        }
        if (alreadyExistingComponents.length === 1) {
            const response = yield (0, prompts_1.default)({
                type: 'text',
                name: 'value',
                message: `The ${alreadyExistingComponents[0]} component already exists. Kindly proceed if you wish to replace. Be advised that if there are any interdependent components, proceeding will result in their dependent components being replaced as well.`,
                initial: 'y',
            });
            if (response.value.toLowerCase() === 'y') {
                selectedComponents = alreadyExistingComponents;
            }
        }
        else if (alreadyExistingComponents.length > 0) {
            const response = yield (0, prompts_1.default)({
                type: 'multiselect',
                name: 'value',
                message: `The following components already exists. Kindly choose the ones you wish to replace. Be advised that if there are any interdependent components, selecting them for replacement will result in their dependent components being replaced as well.`,
                choices: alreadyExistingComponents.map(component => ({
                    title: component,
                    value: component,
                })),
            });
            selectedComponents = response.value;
        }
        // Remove repeated components from all components
        const filteredComponents = specificComponents.filter(component => !alreadyExistingComponents.includes(component));
        // Add selected components to all components
        const updatedComponents = filteredComponents.concat(selectedComponents);
        existingComponentsChecked = true;
        return updatedComponents;
    });
    const componentAdder = (requestedComponent = '') => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Get config
            const sourcePath = `${homeDir}/.gluestack/cache/gluestack-ui/example/storybook/src/ui-components`;
            const requestedComponents = [];
            const groupedComponents = {};
            let addComponents = [];
            if (requestedComponent === '--all') {
                fs_extra_1.default.readdirSync(sourcePath).forEach((component) => {
                    if (!(component === 'index.ts' ||
                        component === 'index.tsx' ||
                        component === 'Provider')) {
                        const packageJsonPath = `${sourcePath}/${component}/config.json`;
                        const packageJson = JSON.parse(fs_extra_1.default.readFileSync(packageJsonPath, 'utf8'));
                        let componentType;
                        if (packageJson.keywords.indexOf('components') !== -1) {
                            componentType = packageJson.keywords[1];
                        }
                        if (componentType) {
                            const cliComponent = pascalToDash(component);
                            groupedComponents[componentType] =
                                groupedComponents[componentType] || [];
                            groupedComponents[componentType].push(cliComponent);
                            requestedComponents.push(cliComponent);
                        }
                    }
                });
            }
            else {
                requestedComponents.push(requestedComponent);
            }
            if (!existingComponentsChecked) {
                componentsToBeAdded = yield checkForExistingFolders(requestedComponents);
                addComponents = [...componentsToBeAdded];
            }
            else {
                // addComponents = requestedComponents.filter(element =>
                //   componentsToBeAdded.includes(pascalToDash(element))
                // );
                addComponents = requestedComponents;
            }
            yield Promise.all(addComponents.map((component) => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                const configFile = fs_extra_1.default.readFileSync(`${currDir}/gluestack-ui.config.ts`, 'utf-8');
                const match = configFile.match(/componentPath:\s+'([^']+)'/);
                const componentPath = (_b = (match && match[1])) !== null && _b !== void 0 ? _b : '';
                (0, utils_1.createFolders)(path_1.default.join(currDir, componentPath));
                const targetPath = path_1.default.join(currDir, componentPath);
                yield copyFolders(sourcePath, targetPath, component);
                yield addIndexFile(targetPath);
            })));
        }
        catch (err) {
            console.log('\x1b[31m%s\x1b[0m', 'Error adding components:', err.message);
        }
    });
    exports.componentAdder = componentAdder;
    const addProvider = (sourcePath, targetPath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Create necessary folders
            (0, utils_1.createFolders)(`${targetPath}/core`);
            (0, utils_1.createFolders)(`${targetPath}/core/GluestackUIProvider`);
            (0, utils_1.createFolders)(`${targetPath}/core/styled`);
            // Copy Provider and styled folder
            yield copyAsync(`${sourcePath}/Provider`, `${targetPath}/core/GluestackUIProvider`);
            yield copyAsync(`${sourcePath}/styled`, `${targetPath}/core/styled`);
            // Copy Gluestack UI config to root
            const gluestackConfig = yield fs_extra_1.default.readFile(path_1.default.resolve(sourcePath, '../', 'gluestack-ui.config.ts'), 'utf8');
            yield fs_extra_1.default.writeFile(`${currDir}/gluestack-ui.config.ts`, gluestackConfig);
            // Delete config.json files
            fs_extra_1.default.unlinkSync(`${targetPath}/core/GluestackUIProvider/config.json`);
            fs_extra_1.default.unlinkSync(`${targetPath}/core/styled/config.json`);
            // Update Provider Config Path
            const providerIndexFile = yield fs_extra_1.default.readFile(`${targetPath}/core/GluestackUIProvider/index.tsx`, 'utf8');
            const modifiedProviderIndexFile = providerIndexFile.replace('./gluestack-ui.config', path_1.default
                .relative(`${targetPath}/core/GluestackUIProvider/index.tsx`, `${currDir}/gluestack-ui.config`)
                .slice(3));
            fs_extra_1.default.writeFileSync(`${targetPath}/core/GluestackUIProvider/index.tsx`, modifiedProviderIndexFile);
            // Update Gluestack UI config file
            const configFile = yield fs_extra_1.default.readFile(`${currDir}/gluestack-ui.config.ts`, 'utf8');
            const folderName = targetPath.split('/').slice(-1)[0];
            const newConfig = configFile.replace(/componentPath:\s+'[^']+'/, `componentPath: './${folderName}'`);
            fs_extra_1.default.writeFileSync(`${currDir}/gluestack-ui.config.ts`, newConfig);
            console.log('\x1b[32m%s\x1b[0m', 'gluestack-ui provider added successfully!');
        }
        catch (err) {
            console.log('\x1b[31m%s\x1b[0m', 'Error while adding gluestack-ui provider:', err.message);
        }
    });
    const getComponentGitRepo = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Clone repo locally in users home directory
            const cloneLocation = `${homeDir}/.gluestack/cache`;
            const clonedPath = `${cloneLocation}/gluestack-ui`;
            const clonedRepoExists = yield (0, utils_1.checkIfFolderExists)(clonedPath);
            if (clonedRepoExists) {
                console.log('gluestack-ui repository already cloned.');
                yield (0, utils_1.pullComponentRepo)(clonedPath);
            }
            else {
                console.log('Cloning gluestack-ui repository...');
                (0, utils_1.createFolders)(cloneLocation);
                yield (0, utils_1.cloneComponentRepo)(clonedPath, 'https://github.com/gluestack/gluestack-ui.git');
                console.log('gluestack-ui repository cloned successfully.');
            }
        }
        catch (err) {
            console.error('\x1b[31m', `Error while cloning or pulling gluestack-ui repository: ${err}`, '\x1b[0m');
        }
    });
    exports.getComponentGitRepo = getComponentGitRepo;
    const initialProviderAdder = (componentFolderPath) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // await getComponentGitRepo();
            (0, utils_1.createFolders)(`${currDir}/${componentFolderPath}`);
            const sourcePath = `${homeDir}/.gluestack/cache/gluestack-ui/example/storybook/src/ui-components`;
            const targetPath = path_1.default.join(currDir, componentFolderPath);
            yield addProvider(sourcePath, targetPath);
            yield addIndexFile(targetPath);
        }
        catch (error) {
            console.log('\x1b[31m%s\x1b[0m', `❌Failed to add gluestack-ui Provider: ${error}`);
        }
    });
    exports.initialProviderAdder = initialProviderAdder;
});
