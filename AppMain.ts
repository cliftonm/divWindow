import { DivWindow } from "./divWindow"

export class AppMain {
    public run() {
        document.getElementById("saveLayout").onclick = () => DivWindow.saveLayout();
        document.getElementById("loadLayout").onclick = () => DivWindow.loadLayout();

        new DivWindow("outerwindow1");
        new DivWindow("outerwindow2");
        new DivWindow("window1").setPosition("0px", "0px");
        new DivWindow("window2", { hasMaximize: false });
        new DivWindow("window3");

        new DivWindow("www")
            .setPosition("50px", "300px")
            .setSize("400px", "400px")
            .create("innerwindow1").setPosition("10px", "50px").setColor("#90EE90")
            .create("innerwindow2").setPosition("60px", "100px").setColor("#add8e6");

        new DivWindow("exampleContent").setPosition("100px", "700px").w = 200;
    }
}
