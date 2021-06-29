﻿class DivWindowPosition {
    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

class DivWindowSize {
    public w: number;
    public h: number;

    constructor(w: number, h: number) {
        this.w = w;
        this.h = h;
    }
}

class DivWindowOptions {
    public hasClose? = true;
    public hasMinimize?= true;
    public hasMaximize?= true;
    public moveMinimizedToBottom?= true;
}

class DivWindow {
    protected dw: HTMLDivElement;
    protected dwc: HTMLDivElement;
    protected mx: number;
    protected my: number;
    protected minimizedState = false;
    protected maximizedState = false;
    protected left: string;
    protected top: string;
    protected width: number;
    protected height: number;
    protected options: DivWindowOptions;

    protected idWindowTemplate: string;
    protected idCaptionBar: string;
    protected idWindowCaption: string;
    protected idWindowDraggableArea: string;
    protected idWindowContent: string;
    protected idClose: string;
    protected idMinimize: string;
    protected idMaximize: string;

    BUTTON_SIZE = 10;
    CAPTION_HEIGHT = 24;
    MINIMIZED_WIDTH = "200px";
    MINIMIZED_HEIGHT = "23px";
    MAXIMIZED_WIDTH = "99%";
    MAXIMIZED_HEIGHT = "99%";
    // MAXIMIZED_PADDING = "0px";

    // inline block automatically sizes the div the the extents of the inner content.
    // https://stackoverflow.com/a/33026219
    protected template = '\
<div id="{w}_windowTemplate" class="divWindowPanel" divWindow>\
    <div id="{w}_captionBar" class="divWindowCaption" style="height: 18px">\
        <div class="noselect" style="position:absolute; top:3px; left:0px; text-align:center; width: 100%">\
            <div id="{w}_windowCaption" style="display:inline-block">\</div>\
            <div style="position:absolute; left:5px; display:inline-block">\
                <div id="{w}_close" class="dot" style="background-color:#FC615C; margin-right: 3px"></div>\
                <div id="{w}_minimize" class="dot" style="background-color: #FDBE40; margin-right: 3px"></div>\
                <div id="{w}_maximize" class="dot" style="background-color: #34CA49"></div>\
            </div>\
        </div>\
        <div id="{w}_windowDraggableArea" class="noselect" style="position:absolute; top:0px; left:55px; width: 100%; height:22px; cursor: move; display:inline-block">&nbsp;</div>\
    </div>\
    <div id="{w}_windowContent" class="divWindowContent"></div>\
</div>\
';

    constructor(id: string, options?: DivWindowOptions) {
        this.setupIDs(id);
        this.options = options ?? new DivWindowOptions();
        const divwin = document.getElementById(id);
        const caption = divwin.getAttribute("caption");
        const content = divwin.innerHTML;

        divwin.innerHTML = this.template.replace(/{w}/g, id);
        document.getElementById(this.idWindowContent).innerHTML = content;

        this.dw = document.getElementById(this.idWindowTemplate) as HTMLDivElement;
        this.dwc = document.getElementById(this.idCaptionBar) as HTMLDivElement;

        this.dwc.onmousedown = () => this.updateZOrder();
        document.getElementById(this.idWindowDraggableArea).onmousedown = e => this.onDraggableAreaMouseDown(e);
        document.getElementById(this.idClose).onclick = () => this.close();
        document.getElementById(this.idMinimize).onclick = () => this.minimizeRestore();
        document.getElementById(this.idMaximize).onclick = () => this.maximizeRestore();

        this.configure(options);
        this.setCaption(caption);
    }

    public create(id: string, options?: DivWindowOptions): DivWindow {
        const newdw = new DivWindow(id, options);

        return newdw;
    }

    public setCaption(caption: string): DivWindow {
        document.getElementById(this.idWindowCaption).innerHTML = caption;

        return this;
    }

    public setColor(color: string): DivWindow {
        this.dw.style.setProperty("border", `1px solid ${color}`);
        this.dwc.style.setProperty("background-color", color);

        return this;
    }

    public setContent(html: string): DivWindow {
        document.getElementById(this.idWindowContent).innerHTML = html;

        return this;
    }

    public getPosition(): DivWindowPosition {
        return { x: this.dw.offsetLeft, y: this.dw.offsetTop };
    }

    public getSize(): DivWindowSize {
        return { w: this.dw.clientWidth, h: this.dw.clientHeight };
    }

    public setPosition(x: string, y: string): DivWindow {
        this.dw.style.left = x;
        this.dw.style.top = y;

        return this;
    }

    public setSize(w: string, h: string): DivWindow {
        this.dw.style.width = w;
        this.dw.style.height = h;

        return this;
    }

    public setWidth(w: string): DivWindow {
        this.dw.style.width = w;

        return this;
    }

    public setHeight(h: string): DivWindow {
        this.dw.style.height = h;

        return this;
    }

    public close(): DivWindow {
        this.dw.remove();

        return this;
    }

    public minimize(atPosition = false): DivWindow {
        this.saveState();
        this.dw.style.height = this.MINIMIZED_HEIGHT;
        this.dw.style.setProperty("resize", "none");
        this.minimizedState = true;
        this.maximizedState = false;

        if (this.options.moveMinimizedToBottom && !atPosition) {
            let minTop;
            
            if (this.isContained()) {
                let el = this.dw.parentElement.parentElement;

                if (el.id.includes("_windowContent")) {
                    el = el.parentElement;
                } 

                minTop = el.offsetHeight - (this.CAPTION_HEIGHT + 3);
            } else {
                minTop = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - (this.CAPTION_HEIGHT + 1);
            }

            const left = this.findAvailableMinimizedSlot(minTop);

            // Force minimized window when moving to bottom to have a fixed width.
            this.dw.style.width = this.MINIMIZED_WIDTH;
            this.dw.style.top = minTop + "px";
            this.dw.style.left = left + "px";
        }

        document.getElementById(this.idWindowDraggableArea).style.setProperty("cursor", "default");

        return this;
    }

    public isContained(): boolean {
        const el = this.dw.parentElement.parentElement;
        const www = el.localName !== "body";

        return www;
    }

    public maximize(): DivWindow {
        this.saveState();

        let el = this.dw.parentElement.parentElement;
        let offsety = 0;
        let www = false;

        // DivWindow within DivWindow?
        if (el.id.includes("_windowContent")) {
            // If so, get the parent container, not the content area.
            el = el.parentElement;

            // Account for the caption:
            offsety = this.CAPTION_HEIGHT;
            www = true;
        }

        // 0, 0, 100%, 100% results in scrollbars.  Ugh.

        this.dw.style.left = 0 + "px";
        this.dw.style.top = offsety + "px";
        this.dw.style.width = this.MAXIMIZED_WIDTH;

        // 5 is some magic number to get the height of a WwW to not extend past the outer window.
        this.dw.style.height = www ? (el.offsetHeight - offsety - 5) + "px" : this.MAXIMIZED_HEIGHT;

        //this.dw.style.left = "0px";
        //this.dw.style.top = "0px";
        //this.dw.style.width = "100%";
        //this.dw.style.height = "100%";

        this.dw.style.setProperty("resize", "none");
        this.maximizedState = true;
        this.minimizedState = false;

        document.getElementById(this.idWindowDraggableArea).style.setProperty("cursor", "default");

        return this;
    }

    public restore(): DivWindow {
        this.restoreState();
        this.dw.style.setProperty("resize", "both");
        this.minimizedState = false;
        this.maximizedState = false;

        return this;
    }

    protected setupIDs(id: string): void {
        this.idWindowTemplate = `${id}_windowTemplate`;
        this.idCaptionBar = `${id}_captionBar`;
        this.idWindowCaption = `${id}_windowCaption`;
        this.idWindowDraggableArea = `${id}_windowDraggableArea`;
        this.idWindowContent = `${id}_windowContent`;
        this.idClose = `${id}_close`;
        this.idMinimize = `${id}_minimize`;
        this.idMaximize = `${id}_maximize`;
    }

    protected saveState(): void {
        this.left = this.dw.style.left;
        this.top = this.dw.style.top;
        this.width = this.dw.clientWidth;
        this.height = this.dw.clientHeight;
    }

    protected restoreState(): void {
        this.dw.style.left = this.left;
        this.dw.style.top = this.top;
        this.dw.style.width = this.width + "px";
        this.dw.style.height = this.height + "px";

        document.getElementById(this.idWindowDraggableArea).style.setProperty("cursor", "move");
    }

    protected minimizeRestore(): void {
        this.minimizedState ? this.restore() : this.minimize();
    }

    protected maximizeRestore(): void {
        this.maximizedState ? this.restore() : this.maximize();
    }

    protected updateZOrder(): void {
        // Get all divWindow instances in the document so the 
        // current divWindow becomes topmost of all.
        const nodes = this.getDivWindows(true);

        const maxz = Math.max(
            ...Array.from(nodes)
                .map(n =>
                    parseInt(window.document.defaultView.getComputedStyle(n).getPropertyValue("z-index"))
            ));

        this.dw.style.setProperty("z-index", (maxz + 1).toString());
    }

    protected getDivWindows(useDocument = false): NodeListOf<Element> {
        const el = this.dw.parentElement.parentElement;
        const els = ((el.localName === "body" || useDocument) ? document : el).querySelectorAll("[divWindow]");

        return els;
    }

    protected onDraggableAreaMouseDown(e: MouseEvent): void {
        // Should not be draggable but we'll check anyways.
        if (!this.minimizedState && !this.maximizedState) {
            this.updateZOrder();
            this.startDrag(e);
        }
    }

    protected onMouseUp(e: MouseEvent): void {
        this.stopDrag();
    }

    protected onMouseMove(e: MouseEvent): void {
        const dx = this.mx - e.clientX;
        const dy = this.my - e.clientY;

        const dwx = this.dw.offsetLeft - dx;
        const dwy = this.dw.offsetTop - dy;

        const pos = this.contain(dwx, dwy);

        // offsetLeft and offsetTop are numbers, whereas dw.style.left/top is a string.
        // But interestingly, offsetLeft and offsetTop are read-only properties!
        this.dw.style.left = pos.x + "px";
        this.dw.style.top = pos.y + "px";
        this.updateMousePosition(e);
    }

    protected contain(dwx: number, dwy: number): DivWindowPosition {
        let el = this.dw.parentElement.parentElement;
        let offsety = 0;

        // DivWindow within DivWindow?
        if (el.id.includes("_windowContent")) {
            // If so, get the parent container, not the content area.
            el = el.parentElement;

            // Account for the caption:
            offsety = this.CAPTION_HEIGHT;
        }

        dwx = dwx < 0 ? 0 : dwx;
        dwy = dwy < offsety ? offsety : dwy;

        // Constrained within a parent?
        if (el.localName !== "body") {

            if (dwx + this.dw.offsetWidth >= el.offsetWidth) {
                dwx = el.offsetWidth - this.dw.offsetWidth - 1;
            }

            if (dwy + this.dw.offsetHeight >= el.offsetHeight) {
                dwy = el.offsetHeight - this.dw.offsetHeight - 1;
            }
        }

        return { x: dwx, y: dwy };
    }

    protected startDrag(e: MouseEvent): void {
        this.updateMousePosition(e);

        // We use window, not dw, because the user can move the mouse far enough in one event
        // to be outside of the dw div element.
        window.onmousemove = e => this.onMouseMove(e);
        window.onmouseup = e => this.onMouseUp(e);
    }

    protected stopDrag(): void {
        window.onmousemove = null;
        window.onmouseup = null;
    }

    protected updateMousePosition(e: MouseEvent): void {
        this.mx = e.clientX;
        this.my = e.clientY;
    }

    protected configure(options?: DivWindowOptions): void {
        if (options) {
            options.hasClose = options.hasClose === undefined ? true : options.hasClose;
            options.hasMinimize = options.hasMinimize === undefined ? true : options.hasMinimize;
            options.hasMaximize = options.hasMaximize === undefined ? true : options.hasMaximize;
            options.moveMinimizedToBottom = options.moveMinimizedToBottom === undefined ? true : options.moveMinimizedToBottom;

            if (!options.hasClose) {
                document.getElementById(this.idClose).style.display = "none";
            }

            if (!options.hasMinimize) {
                document.getElementById(this.idMinimize).style.display = "none";
            }

            if (!options.hasMaximize) {
                document.getElementById(this.idMaximize).style.display = "none";
            }
        }
    }

    protected findAvailableMinimizedSlot(minTop: number): number {
        const nodes = this.getDivWindows();

        let leftOfLeftmost = Math.min(
            ...(Array.from(nodes) as HTMLDivElement[])
                .filter(n => n.offsetTop === minTop)
                .map(n => n.offsetLeft));

        let rightOfRightmost = Math.max(
            ...(Array.from(nodes) as HTMLDivElement[])
                .filter(n => n.offsetTop === minTop)
                .map(n => n.offsetLeft + n.offsetWidth));

        leftOfLeftmost = leftOfLeftmost === Infinity ? 0 : leftOfLeftmost;
        rightOfRightmost = rightOfRightmost === -Infinity ? 0 : rightOfRightmost;

        // Use a slot to the left if it exists, otherwise we need to use the next slot to the right.
        const left = leftOfLeftmost !== 0 ? leftOfLeftmost - 200 : rightOfRightmost;

        return left;
    }
}

window.onload = () => {

    new DivWindow("outerwindow1").setPosition("50px", "50px");
    new DivWindow("outerwindow2").setPosition("50px", "200px");
    new DivWindow("window1").setPosition("0px", "0px");
    // const dw = new DivWindow("window1", { hasClose: false, hasMinimize: false, moveMinimizedToBottom: false }); //, hasMinimize: false, hasMaximize: false });
    // dw.setCaption("Test test Test");
    // dw.setColor("green");
    // dw.setContent("<p>All good men<br/>Must come to an end.</p>");
    // dw.setPosition("50px", "250px");
    // dw.setSize("250px", "150px");
    // const pos = dw.getPosition();
    // const size = dw.getSize();

    const dw2 = new DivWindow("window2", { hasMaximize: false });

    const dw3 = new DivWindow("window3", { hasClose: false, hasMaximize: false, moveMinimizedToBottom: false });
    dw3.setPosition("250px", "50px");
    dw3.setWidth("300px");
    dw3.setColor("darkred");
//    dw2.setCaption("My Window");
//    dw2.setContent("Hello World");

    new DivWindow("www")
        .setPosition("50px", "300px")
        .setSize("400px", "400px")
        .create("innerwindow1").setPosition("10px", "50px").setColor("#90EE90")
        .create("innerwindow2").setPosition("60px", "100px").setColor("#add8e6");

    //document.getElementById("test").onclick = () => alert("click div");
    //document.getElementById("{w}_windowCaption").onclick = () => alert("click caption");
    //document.getElementById("{w}_close").onclick = () => alert("close");
    //document.getElementById("{w}_minimize").onclick = () => alert("min");
    // document.getElementById("{w}_captionBar").onmousedown = () => alert("Mouse Down");
};
