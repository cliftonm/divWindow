class DivWindowPosition {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
class DivWindowSize {
    constructor(w, h) {
        this.w = w;
        this.h = h;
    }
}
class DivWindowOptions {
    constructor() {
        this.hasClose = true;
        this.hasMinimize = true;
        this.hasMaximize = true;
        this.moveMinimizedToBottom = true;
    }
}
class DivWindow {
    constructor(id, options) {
        this.minimizedState = false;
        this.maximizedState = false;
        this.CAPTION_HEIGHT = 24;
        this.MINIMIZED_WIDTH = "200px";
        this.MINIMIZED_HEIGHT = "23px";
        this.MAXIMIZED_WIDTH = "99%";
        this.MAXIMIZED_HEIGHT = "99%";
        this.MAXIMIZED_PADDING = "3px";
        // inline block automatically sizes the div the the extents of the inner content.
        // https://stackoverflow.com/a/33026219
        this.template = '\
        <div id="{w}_windowTemplate" class="divWindowPanel" style="display:inline-block" divWindow>\
            <div id="{w}_captionBar" class="divWindowCaption">\
                <div style="margin-left:2px">\
                    <div id="{w}_close" class="dot" style="background-color:#FC615C; margin-right: 3px"></div>\
                    <div id="{w}_minimize" class="dot" style="background-color: #FDBE40; margin-right: 3px"></div>\
                    <div id="{w}_maximize" class="dot" style="background-color: #34CA49"></div>\
                </div>\
                <div id="{w}_windowCaption" class="noselect" style="position:absolute; top:3px; left:0px; text-align:center; width: 100%"></div>\
                <div id="{w}_windowDraggableArea" class="noselect" style="position:absolute; top:0px; left:65px; width: 100%; height:22px; cursor: move">&nbsp;</div>\
            </div>\
            <div id="{w}_windowContent" class="divWindowContent"></div>\
        </div>\
';
        this.setupIDs(id);
        this.options = options !== null && options !== void 0 ? options : new DivWindowOptions();
        const win = document.getElementById(id);
        const caption = win.getAttribute("caption");
        const startingHtml = win.innerHTML;
        win.innerHTML = this.template.replace(/{w}/g, id);
        this.dw = document.getElementById(this.idWindowTemplate);
        this.dwc = document.getElementById(this.idCaptionBar);
        this.dwc.onmousedown = e => this.onMouseDown(e);
        document.getElementById(this.idWindowContent).innerHTML = startingHtml;
        this.configure(options);
        this.setCaption(caption);
    }
    create(id, options) {
        const newdw = new DivWindow(id, options);
        return newdw;
    }
    setCaption(caption) {
        document.getElementById(this.idWindowCaption).innerHTML = caption;
        return this;
    }
    setColor(color) {
        this.dw.style.setProperty("border", `1px solid ${color}`);
        this.dwc.style.setProperty("background-color", color);
        return this;
    }
    setContent(html) {
        document.getElementById(this.idWindowContent).innerHTML = html;
        return this;
    }
    getPosition() {
        return new DivWindowPosition(this.dw.offsetLeft, this.dw.offsetTop);
    }
    getSize() {
        return new DivWindowSize(this.dw.clientWidth, this.dw.clientHeight);
    }
    setPosition(x, y) {
        this.dw.style.left = x;
        this.dw.style.top = y;
        return this;
    }
    setSize(w, h) {
        this.dw.style.width = w;
        this.dw.style.height = h;
        return this;
    }
    setWidth(w) {
        this.dw.style.width = w;
        return this;
    }
    setHeight(h) {
        this.dw.style.height = h;
        return this;
    }
    close() {
        this.dw.remove();
        return this;
    }
    minimize(atPosition = false) {
        this.saveState();
        this.dw.style.height = this.MINIMIZED_HEIGHT;
        this.dw.style.setProperty("resize", "none");
        this.minimizedState = true;
        this.maximizedState = false;
        if (this.options.moveMinimizedToBottom && !atPosition) {
            const minTop = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 25;
            const left = this.findAvailableMinimizedSlot(minTop);
            // Force minimized window when moving to bottom to have a fixed width.
            this.dw.style.width = this.MINIMIZED_WIDTH;
            this.dw.style.top = minTop + "px";
            this.dw.style.left = left + "px";
            // Should we disable dragging when minimized at the bottom?
        }
        return this;
    }
    maximize() {
        this.saveState();
        // 0, 0, 100%, 100% results in scrollbars.  Ugh.
        this.dw.style.left = this.MAXIMIZED_PADDING;
        this.dw.style.top = this.MAXIMIZED_PADDING;
        this.dw.style.width = this.MAXIMIZED_WIDTH;
        this.dw.style.height = this.MAXIMIZED_HEIGHT;
        //this.dw.style.left = "0px";
        //this.dw.style.top = "0px";
        //this.dw.style.width = "100%";
        //this.dw.style.height = "100%";
        this.dw.style.setProperty("resize", "none");
        this.maximizedState = true;
        this.minimizedState = false;
        return this;
    }
    restore() {
        this.restoreState();
        this.dw.style.setProperty("resize", "both");
        this.minimizedState = false;
        this.maximizedState = false;
        return this;
    }
    setupIDs(id) {
        this.idWindowTemplate = `${id}_windowTemplate`;
        this.idCaptionBar = `${id}_captionBar`;
        this.idWindowCaption = `${id}_windowCaption`;
        this.idWindowDraggableArea = `${id}_windowDraggableArea`;
        this.idWindowContent = `${id}_windowContent`;
        this.idClose = `${id}_close`;
        this.idMinimize = `${id}_minimize`;
        this.idMaximize = `${id}_maximize`;
    }
    saveState() {
        this.left = this.dw.style.left;
        this.top = this.dw.style.top;
        this.width = this.dw.clientWidth;
        this.height = this.dw.clientHeight;
    }
    restoreState() {
        this.dw.style.left = this.left;
        this.dw.style.top = this.top;
        this.dw.style.width = this.width + "px";
        this.dw.style.height = this.height + "px";
    }
    minimizeRestore() {
        this.minimizedState ? this.restore() : this.minimize();
    }
    maximizeRestore() {
        this.maximizedState ? this.restore() : this.maximize();
    }
    updateZOrder() {
        // Get all divWindow instances in the document so the 
        // current divWindow becomes topmost of all.
        const nodes = this.getDivWindows(true);
        const maxz = Math.max(...Array.from(nodes)
            .map(n => parseInt(window.document.defaultView.getComputedStyle(n).getPropertyValue('z-index'))));
        this.dw.style.setProperty("z-index", (maxz + 1).toString());
    }
    getDivWindows(useDocument = false) {
        const el = this.dw.parentElement.parentElement;
        const els = ((el.localName === "body" || useDocument) ? document : el).querySelectorAll("[divWindow]");
        return els;
    }
    onMouseDown(e) {
        // debugging:
        // alert(`${e.clientX}, ${e.clientY}\r\n${this.dw.offsetLeft}, ${this.dw.offsetTop}\r\n${dot1.offsetLeft}, ${dot1.offsetTop}`);
        this.updateZOrder();
        const da = document.getElementById(this.idWindowDraggableArea);
        const dot1 = document.getElementById(this.idClose);
        const dot2 = document.getElementById(this.idMinimize);
        const dot3 = document.getElementById(this.idMaximize);
        // Start drag only when mouse is is the draggable area.
        if (this.dw.offsetLeft + da.offsetLeft < e.clientX) {
            this.startDrag(e);
        }
        else if (this.options.hasClose && e.clientX >= this.dw.offsetLeft + dot1.offsetLeft && e.clientX <= this.dw.offsetLeft + dot1.offsetLeft + 10) {
            this.close();
        }
        else if (this.options.hasMinimize && e.clientX >= this.dw.offsetLeft + dot2.offsetLeft && e.clientX <= this.dw.offsetLeft + dot2.offsetLeft + 10) {
            this.minimizeRestore();
        }
        else if (this.options.hasMaximize && e.clientX >= this.dw.offsetLeft + dot3.offsetLeft && e.clientX <= this.dw.offsetLeft + dot3.offsetLeft + 10) {
            this.maximizeRestore();
        }
    }
    onMouseUp(e) {
        this.stopDrag();
    }
    onMouseMove(e) {
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
    contain(dwx, dwy) {
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
        return new DivWindowPosition(dwx, dwy);
    }
    startDrag(e) {
        this.updateMousePosition(e);
        // We use window, not dw, because the user can move the mouse far enough in one event
        // to be outside of the dw div element.
        window.onmousemove = e => this.onMouseMove(e);
        window.onmouseup = e => this.onMouseUp(e);
    }
    stopDrag() {
        window.onmousemove = null;
        window.onmouseup = null;
    }
    updateMousePosition(e) {
        this.mx = e.clientX;
        this.my = e.clientY;
    }
    configure(options) {
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
    findAvailableMinimizedSlot(minTop) {
        const nodes = this.getDivWindows();
        let leftOfLeftmost = Math.min(...Array.from(nodes)
            .filter(n => n.offsetTop === minTop)
            .map(n => n.offsetLeft));
        let rightOfRightmost = Math.max(...Array.from(nodes)
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
    const dw2 = new DivWindow("window2", { hasMaximize: false, moveMinimizedToBottom: false });
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
};
//# sourceMappingURL=divWindow.js.map