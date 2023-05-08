#!/usr/bin/env node
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
        define(["require", "exports", "./component-adder", "./update-component", "./installer/initializer", "./remove-component", "@clack/prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const component_adder_1 = require("./component-adder");
    const update_component_1 = require("./update-component");
    const initializer_1 = require("./installer/initializer");
    const remove_component_1 = require("./remove-component");
    const prompts_1 = require("@clack/prompts");
    function main() {
        return __awaiter(this, void 0, void 0, function* () {
            (0, prompts_1.intro)(`gluestack-ui`);
            const command = process.argv[2];
            const subCommand = process.argv[3];
            if (command === 'help') {
                prompts_1.log.message(`
\x1b[36m- Init and add components\x1b[0m
  \x1b[33mnpx gluestack-ui@latest\x1b[0m

\x1b[36m- Init gluestack-ui\x1b[0m
  \x1b[33mnpx gluestack-ui@latest init\x1b[0m
  
\x1b[36m- Add component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest add <component-name>\x1b[0m

\x1b[36m- Add all component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest add --all\x1b[0m
  
\x1b[36m- Update a component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest update <component-name>\x1b[0m
  
\x1b[36m- Update all component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest update --all\x1b[0m

\x1b[36m- Remove a component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest remove <component-name>\x1b[0m
  
\x1b[36m- Remove all component\x1b[0m
  \x1b[33mnpx gluestack-ui@latest remove --all\x1b[0m

\x1b[36m- Help\x1b[0m
  \x1b[33mnpx gluestack-ui@latest help\x1b[0m   
        `);
            }
            else {
                yield (0, component_adder_1.getComponentGitRepo)();
                const askUserToInit = true;
                if (command === 'init') {
                    const { gluestackUIConfigPresent: alreadyInitialised, } = yield (0, initializer_1.initializer)(!askUserToInit);
                    if (alreadyInitialised) {
                        prompts_1.log.info(`Ready to create amazing designs with ease? Let's start with the simple \x1b[36mBox\x1b[0m component. Check out \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to get started!`);
                        prompts_1.log.info(`🚀 Feeling adventurous? Try out the \x1b[36m'npx gluestack-ui@latest add box'\x1b[0m command in your project and watch the magic happen! ✨`);
                    }
                    else {
                        // await installDependencies();
                        prompts_1.log.info(`\x1b[1m\x1b[36mCongrats, gluestack-ui is now part of your project! 🎉\x1b[0m\nTime to unleash your creativity with the simple \x1b[36mBox\x1b[0m component. Head over to \x1b[36mhttps://ui.gluestack.io/docs/components/layout/box\x1b[0m to learn more!`);
                        prompts_1.log.info(`Feeling adventurous? Try the \x1b[1m\x1b[36mnpx gluestack-ui@latest add box\x1b[0m\x1b[0m command and watch the magic happen. ✨`);
                    }
                }
                else if (command === 'add') {
                    const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                    if (gluestackUIInstalled) {
                        if (subCommand === '--all') {
                            try {
                                yield (0, component_adder_1.componentAdder)('--all');
                            }
                            catch (err) {
                                prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
                            }
                        }
                        else {
                            yield (0, component_adder_1.componentAdder)(subCommand);
                        }
                        // await installDependencies();
                    }
                }
                else if (command === 'update') {
                    const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                    if (gluestackUIInstalled) {
                        if (subCommand === '--all') {
                            try {
                                const shouldContinue = yield (0, prompts_1.confirm)({
                                    message: 'Are you sure you want to update all components? This will remove all your existing changes and replace them with new components.\nPlease make sure to commit your current changes before proceeding.',
                                });
                                if (shouldContinue) {
                                    yield (0, update_component_1.updateComponent)('--all');
                                }
                            }
                            catch (err) {
                                prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
                            }
                        }
                        else if (subCommand) {
                            yield (0, update_component_1.updateComponent)(subCommand);
                        }
                        else {
                            prompts_1.log.error(`\x1b[31mInvalid command, checkout help command by running npx gluestack-ui@latest help\x1b[0m`);
                        }
                        // await installDependencies();
                    }
                }
                else if (command === 'remove') {
                    const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                    if (gluestackUIInstalled) {
                        if (subCommand === '--all') {
                            try {
                                const shouldContinue = yield (0, prompts_1.confirm)({
                                    message: 'Are you sure you want to remove all components?',
                                });
                                if (shouldContinue) {
                                    yield (0, remove_component_1.removeComponent)('--all');
                                }
                            }
                            catch (err) {
                                prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
                            }
                        }
                        else if (subCommand) {
                            yield (0, remove_component_1.removeComponent)(subCommand);
                        }
                        else {
                            prompts_1.log.error(`\x1b[31mInvalid command, checkout help command by running npx gluestack-ui@latest help\x1b[0m`);
                        }
                    }
                }
                else {
                    const { gluestackUIInstalled } = yield (0, initializer_1.initializer)(askUserToInit);
                    if (gluestackUIInstalled) {
                        yield (0, component_adder_1.componentAdder)(subCommand);
                        // await installDependencies();
                    }
                }
            }
            (0, prompts_1.outro)(`You're all set!`);
        });
    }
    main();
});
