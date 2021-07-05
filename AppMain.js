define(["require", "exports", "./divWindow"], function (require, exports, divWindow_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AppMain = void 0;
    class AppMain {
        run() {
            document.getElementById("saveLayout").onclick = () => divWindow_1.DivWindow.saveLayout();
            document.getElementById("loadLayout").onclick = () => divWindow_1.DivWindow.loadLayout();
            new divWindow_1.DivWindow("outerwindow1");
            new divWindow_1.DivWindow("outerwindow2");
            new divWindow_1.DivWindow("window1").setPosition("0px", "0px");
            new divWindow_1.DivWindow("window2", { hasMaximize: false });
            new divWindow_1.DivWindow("window3");
            new divWindow_1.DivWindow("www")
                .setPosition("50px", "300px")
                .setSize("400px", "400px")
                .create("innerwindow1").setPosition("10px", "50px").setColor("#90EE90")
                .create("innerwindow2").setPosition("60px", "100px").setColor("#add8e6");
            new divWindow_1.DivWindow("exampleContent").setPosition("100px", "700px").w = 300;
            document.getElementById("button").onclick = () => alert("Clicked");
        }
    }
    exports.AppMain = AppMain;
});
//# sourceMappingURL=AppMain.js.map