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
            // const dw = new DivWindow("window1", { hasClose: false, hasMinimize: false, moveMinimizedToBottom: false }); //, hasMinimize: false, hasMaximize: false });
            // dw.setCaption("Test test Test");
            // dw.setColor("green");
            // dw.setContent("<p>All good men<br/>Must come to an end.</p>");
            // dw.setPosition("50px", "250px");
            // dw.setSize("250px", "150px");
            // const pos = dw.getPosition();
            // const size = dw.getSize();
            const dw2 = new divWindow_1.DivWindow("window2", { hasMaximize: false });
            const dw3 = new divWindow_1.DivWindow("window3");
            //    dw2.setCaption("My Window");
            //    dw2.setContent("Hello World");
            new divWindow_1.DivWindow("www")
                .setPosition("50px", "300px")
                .setSize("400px", "400px")
                .create("innerwindow1").setPosition("10px", "50px").setColor("#90EE90")
                .create("innerwindow2").setPosition("60px", "100px").setColor("#add8e6");
            //document.getElementById("test").onclick = () => alert("click div");
            //document.getElementById("{w}_windowCaption").onclick = () => alert("click caption");
            //document.getElementById("{w}_close").onclick = () => alert("close");
            //document.getElementById("{w}_minimize").onclick = () => alert("min");
            // document.getElementById("{w}_captionBar").onmousedown = () => alert("Mouse Down");
        }
    }
    exports.AppMain = AppMain;
});
//# sourceMappingURL=AppMain.js.map