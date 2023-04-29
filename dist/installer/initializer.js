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
        define(["require", "exports", "prompts", "../init-checker", "../component-adder", "@gluestack/ui-project-detector", "./next", "./expo"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.initializer = void 0;
    const prompts_1 = __importDefault(require("prompts"));
    const init_checker_1 = require("../init-checker");
    const component_adder_1 = require("../component-adder");
    const ui_project_detector_1 = require("@gluestack/ui-project-detector");
    const next_1 = require("./next");
    const expo_1 = require("./expo");
    const installGluestackUI = () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield (0, prompts_1.default)({
                type: 'text',
                name: 'folderName',
                message: 'Enter folder path where you want to add your components',
                initial: 'components',
            });
            yield (0, component_adder_1.initialProviderAdder)('./' + response.folderName);
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
            if (projectData.framework === 'Next' && projectData.os === 'darwin') {
                setupTypeAutomatic = yield (0, next_1.nextInstaller)(response.folderName);
                if (setupTypeAutomatic) {
                    console.log('\x1b[32m', '\nAuto setup was successful!');
                }
                else {
                    console.log('\x1b[32m', finalMessage);
                    console.log('\x1b[32m', `\nPlease visit https://ui.gluestack.io/docs/getting-started/install-nextjs for more information on manual setup.`);
                }
            }
            else if (projectData.framework === 'Expo' &&
                projectData.os === 'darwin') {
                yield (0, expo_1.expoInstaller)();
                console.log('\x1b[32m', finalMessage);
            }
            else {
                console.warn('\x1b[31m%s\x1b[0m', 'WARNING: The gluestack-ui CLI is currently in an experimental stage for your specific framework or operating system configuration.');
                yield (0, expo_1.expoInstaller)();
            }
        }
        catch (error) {
            console.error('\x1b[31m', `Error installing gluestack-ui: ${error.message}`);
        }
    });
    const initializer = (askUserToInit) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const gluestackUIConfigPresent = yield (0, init_checker_1.initChecker)();
            if (!gluestackUIConfigPresent) {
                let install = true;
                if (askUserToInit) {
                    console.log('\x1b[31m', `\ngluestack-ui is not initialised in your project!`, '\x1b[0m');
                    const proceedResponse = yield (0, prompts_1.default)({
                        type: 'text',
                        name: 'proceed',
                        message: 'Do you wish to initialise it? (y/n) ',
                        initial: 'y',
                    });
                    if (proceedResponse.proceed.toLowerCase() === 'n') {
                        install = false;
                    }
                }
                if (install) {
                    yield installGluestackUI();
                }
                console.log('\x1b[32m', 'gluestack-ui initialization completed!', '\x1b[0m');
            }
            else {
                console.log('\u001b[32mgluestack-ui is already initialized in your project!\u001b[0m');
            }
            return gluestackUIConfigPresent;
        }
        catch (err) {
            console.error('\x1b[31m', `Error initializing gluestack-ui: ${err.message}`);
            return false;
        }
    });
    exports.initializer = initializer;
});
