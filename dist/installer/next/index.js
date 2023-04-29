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
        define(["require", "exports", "../utils", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.nextInstaller = void 0;
    const utils_1 = __importDefault(require("../utils"));
    const utils_2 = require("./utils");
    const nextInstaller = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            (0, utils_1.default)('Next');
            const setupTypeAutomatic = yield (0, utils_2.autoSetup)(folderName);
            // await installDependencies();
            return setupTypeAutomatic === 'y';
        }
        catch (err) {
            console.error(`Error installing Next.js dependencies: ${err.message}`);
            return false;
        }
    });
    exports.nextInstaller = nextInstaller;
});
