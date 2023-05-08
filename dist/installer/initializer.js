var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../init-checker", "../component-adder", "@gluestack/ui-project-detector", "./next", "./expo", "@clack/prompts", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializer = void 0;
    const init_checker_1 = require("../init-checker");
    const component_adder_1 = require("../component-adder");
    const ui_project_detector_1 = require("@gluestack/ui-project-detector");
    const next_1 = require("./next");
    const expo_1 = require("./expo");
    const prompts_1 = require("@clack/prompts");
    const utils_1 = require("./utils");
    const installGluestackUI = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let folderPath = yield (0, prompts_1.text)({
                message: 'Can you please provide the path where you would like to add your components?',
                placeholder: './components',
                initialValue: './components',
                validate(value) {
                    if (value.length === 0)
                        return `Value is required!`;
                },
            });
            if ((0, prompts_1.isCancel)(folderPath)) {
                (0, prompts_1.cancel)('Operation cancelled.');
                process.exit(0);
            }
            const isSrcDir = (0, utils_1.isFollowingSrcDir)();
            const isSrcIncludedInPath = (0, utils_1.isStartingWithSrc)(folderPath);
            if (isSrcDir && !isSrcIncludedInPath) {
                const shouldContinue = yield (0, prompts_1.confirm)({
                    message: `Detected "src" folder. Do you want to update component paths to use "${(0, utils_1.mergePaths)(folderPath, './src')}"?`,
                });
                if ((0, prompts_1.isCancel)(shouldContinue)) {
                    (0, prompts_1.cancel)('Operation cancelled.');
                    process.exit(0);
                }
                if (shouldContinue) {
                    folderPath = (0, utils_1.mergePaths)(folderPath, './src');
                    prompts_1.log.success('Component paths updated to use "./src/components".');
                }
                else {
                    prompts_1.log.warning('Component paths not updated.');
                }
            }
            yield (0, component_adder_1.initialProviderAdder)(folderPath);
            const finalMessage = `
    Gluestack Provider has been added to your components folder.
    To use it, simply wrap your app component with the <GluestackUIProvider> component like this:

    export default function App() {
      return (
        <GluestackUIProvider>
          <Component />
        </GluestackUIProvider>
      );
    }
    `;
            const projectData = yield (0, ui_project_detector_1.projectDetector)();
            let setupTypeAutomatic = false;
            if (projectData.framework === 'Next') {
                setupTypeAutomatic = yield (0, next_1.nextInstaller)(folderPath);
                if (setupTypeAutomatic) {
                    prompts_1.log.success('Auto setup was successful!');
                }
                else {
                    prompts_1.log.info('\x1b[32m' + finalMessage + '\x1b[0m');
                    prompts_1.log.info('\x1b[32m' +
                        `Please visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.` +
                        '\x1b[0m');
                }
            }
            else if (projectData.framework === 'Expo') {
                yield (0, expo_1.expoInstaller)();
                prompts_1.log.info('\x1b[32m' + finalMessage + '\x1b[0m');
            }
            else {
                // log.warn(
                //   '\x1b[31mWARNING: The gluestack-ui CLI is currently in an experimental stage for your specific framework or operating system configuration.\x1b[0m'
                // );
                yield (0, expo_1.expoInstaller)();
            }
            return true;
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            return false;
        }
    });
    const initializer = (askUserToInit) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const gluestackUIConfigPresent = yield (0, init_checker_1.initChecker)();
            let gluestackUIInstalled = false;
            if (!gluestackUIConfigPresent) {
                let install = true;
                if (askUserToInit) {
                    prompts_1.log.error('\x1b[31m' +
                        `gluestack-ui is not initialised in your project!` +
                        '\x1b[0m');
                    const shouldContinue = yield (0, prompts_1.confirm)({
                        message: 'Do you wish to initialise it?',
                    });
                    if ((0, prompts_1.isCancel)(shouldContinue)) {
                        (0, prompts_1.cancel)('Operation cancelled.');
                        process.exit(0);
                    }
                    if (!shouldContinue) {
                        install = false;
                    }
                }
                if (install) {
                    gluestackUIInstalled = yield installGluestackUI();
                    prompts_1.log.success('gluestack-ui initialization completed!');
                }
                else {
                    prompts_1.log.error('\u001b[31mgluestack-ui initialization canceled!\u001b[0m');
                }
            }
            else {
                gluestackUIInstalled = true;
                prompts_1.log.success('\u001b[32mgluestack-ui is already initialized in your project!\u001b[0m');
            }
            return { gluestackUIConfigPresent, gluestackUIInstalled };
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            return { gluestackUIConfigPresent: false, gluestackUIInstalled: false };
        }
    });
    exports.initializer = initializer;
});
