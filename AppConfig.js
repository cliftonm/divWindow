define(["require", "exports", "./AppMain"], function (require, exports, AppMain_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    require(['AppMain'], (main) => {
        const appMain = new AppMain_1.AppMain();
        appMain.run();
    });
});
//# sourceMappingURL=AppConfig.js.map