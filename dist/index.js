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
        define(["require", "exports", "./component-adder", "./update-component", "./installer/initializer", "prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const component_adder_1 = require("./component-adder");
    const update_component_1 = require("./update-component");
    const initializer_1 = require("./installer/initializer");
    const prompts_1 = __importDefault(require("prompts"));
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            // await getComponentGitRepo();
            const askUserToInit = true;
            const command = process.argv[2];
            const subCommand = process.argv[3];
            if (command === 'help') {
                console.log(`
    \x1b[36m- Init gluestack-ui\x1b[0m
      \x1b[33mnpx gluestack-ui@latest init\x1b[0m
  
    \x1b[36m- Init and add components\x1b[0m
      \x1b[33mnpx gluestack-ui@latest\x1b[0m
  
    \x1b[36m- Add component\x1b[0m
      \x1b[33mnpx gluestack-ui@latest add <component-name>\x1b[0m
  
    \x1b[36m- Update a component\x1b[0m
      \x1b[33mnpx gluestack-ui@latest update <component-name>\x1b[0m
  
    \x1b[36m- Remove a component\x1b[0m
      \x1b[33mnpx gluestack-ui@latest remove <component-name>\x1b[0m
  
    \x1b[36m- Help\x1b[0m
      \x1b[33mnpx gluestack-ui@latest help\x1b[0m`);
            }
            else if (command === 'init') {
                const { gluestackUIConfigPresent: alreadyInitialised } = yield (0, initializer_1.initializer)(!askUserToInit);
                if (alreadyInitialised) {
                    console.log(`\nReady to create amazing designs with ease? Let's start with the simple \x1b[36mBox\x1b[0m component. Check out \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to get started!`);
                    console.log(`\n🚀 Feeling adventurous? Try out the \x1b[36m'npx gluestack-ui@latest add box'\x1b[0m command in your project and watch the magic happen! ✨`);
                }
                else {
                    console.log(`\n\x1b[1m\x1b[36mCongrats, gluestack-ui is now part of your project! 🎉\x1b[0m\nTime to unleash your creativity with the simple \x1b[36mBox\x1b[0m component. Head over to \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to learn more!`);
                    console.log(`\nFeeling adventurous? Try the \x1b[1m\x1b[36mnpx gluestack-ui@latest add box\x1b[0m\x1b[0m command and watch the magic happen. ✨`);
                }
            }
            else if (command === 'add') {
                const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                if (gluestackUIInstalled) {
                    if (subCommand === '--all') {
                        try {
                            const proceedResponse = yield (0, prompts_1.default)({
                                type: 'text',
                                name: 'proceed',
                                message: "Are you sure you want to add all components? This will remove all your existing changes and replace them with new components.\nPlease make sure to commit your current changes before proceeding.\nTo continue, type 'y' for yes. To cancel and exit, type 'n' for no.",
                                initial: 'y',
                            });
                            if (proceedResponse.proceed.toLowerCase() == 'y') {
                                yield (0, component_adder_1.componentAdder)('--all');
                            }
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                    else {
                        yield (0, component_adder_1.componentAdder)(subCommand);
                    }
                }
            }
            else if (command === 'update') {
                const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                if (gluestackUIInstalled) {
                    if (subCommand === '--all') {
                        try {
                            const proceedResponse = yield (0, prompts_1.default)({
                                type: 'text',
                                name: 'proceed',
                                message: "Are you sure you want to update all components? This will remove all your existing changes and replace them with new components.\nPlease make sure to commit your current changes before proceeding.\nTo continue, type 'y' for yes. To cancel and exit, type 'n' for no.",
                                initial: 'y',
                            });
                            if (proceedResponse.proceed.toLowerCase() == 'y') {
                                yield (0, update_component_1.updateComponent)('--all');
                            }
                        }
                        catch (err) {
                            console.log(err);
                        }
                    }
                    else {
                        yield (0, update_component_1.updateComponent)(subCommand);
                    }
                }
            }
            else if (command === 'remove') {
                const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                if (gluestackUIInstalled) {
                    if (subCommand === '--all') {
                        console.log('Removing a component...');
                    }
                    else {
                        console.log('Invalid remove command');
                    }
                }
            }
            else {
                const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                if (gluestackUIInstalled) {
                    yield (0, component_adder_1.componentAdder)(subCommand);
                }
            }
            // await installDependencies();
        });
    }
    main();
});
