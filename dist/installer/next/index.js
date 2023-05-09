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
        define(["require", "exports", "../utils", "./utils", "@clack/prompts"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nextInstaller = void 0;
    const utils_1 = require("../utils");
    const utils_2 = require("./utils");
    const prompts_1 = require("@clack/prompts");
    const nextInstaller = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            (0, utils_1.addDependencies)('Next');
            const setupTypeAutomatic = yield (0, utils_2.autoSetup)(folderName);
            return setupTypeAutomatic;
        }
        catch (err) {
            prompts_1.log.error(`\x1b[31mError: ${err.message}\x1b[0m`);
            return false;
        }
    });
    exports.nextInstaller = nextInstaller;
});
