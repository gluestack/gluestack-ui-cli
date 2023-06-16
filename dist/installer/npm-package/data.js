(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getDataFiles = void 0;
    const getDataFiles = () => {
        const indexData = `
 export * from "./components"
 export { config } from "./gluestack-ui.config"
 `;
        return { indexData };
    };
    exports.getDataFiles = getDataFiles;
});
