define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DivWindow = exports.DivWindowState = exports.DivWindowOptions = exports.DivWindowSize = exports.DivWindowPosition = void 0;
    class DivWindowPosition {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
    }
    exports.DivWindowPosition = DivWindowPosition;
    class DivWindowSize {
        constructor(w, h) {
            this.w = w;
            this.h = h;
        }
    }
    exports.DivWindowSize = DivWindowSize;
    class DivWindowOptions {
        constructor() {
            this.hasClose = true;
            this.hasMinimize = true;
            this.hasMaximize = true;
            this.moveMinimizedToBottom = true;
        }
    }
    exports.DivWindowOptions = DivWindowOptions;
    class DivWindowState {
        constructor() {
            this.minimizedState = false;
            this.maximizedState = false;
        }
    }
    exports.DivWindowState = DivWindowState;
    class DivWindow {
        constructor(id, options) {
            var _a, _b;
            this.minimizedState = false;
            this.maximizedState = false;
            this.BUTTON_SIZE = 10;
            this.CAPTION_HEIGHT = 24;
            this.MINIMIZED_WIDTH = "200px";
            this.MINIMIZED_HEIGHT = "23px";
            this.MAXIMIZED_WIDTH = "99%";
            this.MAXIMIZED_HEIGHT = "99%";
            // MAXIMIZED_PADDING = "0px";
            // inline block automatically sizes the div the the extents of the inner content.
            // https://stackoverflow.com/a/33026219
            this.template = '\
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
            DivWindow.divWindows.push(this);
            this.containerId = id;
            this.setupIDs(id);
            const optionsValue = (_a = document.getElementById(id).attributes["divWindowOptions"]) === null || _a === void 0 ? void 0 : _a.value;
            let declaredOptions;
            if (optionsValue) {
                declaredOptions = JSON.parse(optionsValue);
            }
            // Passed in options overrides any declared options.
            this.options = (_b = options !== null && options !== void 0 ? options : declaredOptions) !== null && _b !== void 0 ? _b : new DivWindowOptions();
            const divwin = document.getElementById(id);
            const caption = divwin.getAttribute("caption");
            const content = divwin.innerHTML;
            divwin.innerHTML = this.template.replace(/{w}/g, id);
            document.getElementById(this.idWindowContent).innerHTML = content;
            this.dw = document.getElementById(this.idWindowTemplate);
            this.dwc = document.getElementById(this.idCaptionBar);
            this.dwc.onmousedown = () => this.updateZOrder();
            document.getElementById(this.idWindowDraggableArea).onmousedown = e => this.onDraggableAreaMouseDown(e);
            document.getElementById(this.idClose).onclick = () => this.close();
            document.getElementById(this.idMinimize).onclick = () => this.minimizeRestore();
            document.getElementById(this.idMaximize).onclick = () => this.maximizeRestore();
            this.configure(this.options);
            this.setCaption(caption);
        }
        get x() {
            return document.getElementById(this.idWindowTemplate).offsetLeft;
        }
        set x(x) {
            document.getElementById(this.idWindowTemplate).style.left = x + "px";
        }
        get y() {
            return document.getElementById(this.idWindowTemplate).offsetTop;
        }
        set y(y) {
            document.getElementById(this.idWindowTemplate).style.top = y + "px";
        }
        get w() {
            return document.getElementById(this.idWindowTemplate).offsetWidth;
        }
        set w(w) {
            document.getElementById(this.idWindowTemplate).style.width = w + "px";
        }
        get h() {
            return document.getElementById(this.idWindowTemplate).offsetHeight;
        }
        set h(h) {
            document.getElementById(this.idWindowTemplate).style.height = h + "px";
        }
        static saveLayout(id) {
            const els = (id ? document.getElementById(id) : document).querySelectorAll("[divWindow]");
            const key = `divWindowState${id !== null && id !== void 0 ? id : "document"}`;
            const states = Array
                .from(els)
                .map(el => DivWindow.divWindows.filter(dw => dw.idWindowTemplate === el.id)[0])
                .filter(dw => dw) // ignore windows we can't find, though this should not happen.
                .map(dw => ({
                id: dw.idWindowTemplate,
                minimizedState: dw.minimizedState,
                maximizedState: dw.maximizedState,
                left: dw.x,
                top: dw.y,
                width: dw.w,
                height: dw.h,
                restoreLeft: dw.left,
                restoreTop: dw.top,
                restoreWidth: dw.width,
                restoreHeight: dw.height
            }));
            window.localStorage.setItem(key, JSON.stringify(states));
        }
        static loadLayout(id) {
            const key = `divWindowState${id !== null && id !== void 0 ? id : "document"}`;
            const jsonStates = window.localStorage.getItem(key);
            if (jsonStates) {
                const states = JSON.parse(jsonStates);
                states.forEach(state => {
                    const dw = DivWindow.divWindows.filter(dw => dw.idWindowTemplate === state.id)[0];
                    // Is it in our list, and does it exist (maybe the user closed it?)
                    if (dw && document.getElementById(dw.idWindowTemplate)) {
                        dw.minimizedState = state.minimizedState;
                        dw.maximizedState = state.maximizedState;
                        dw.left = state.restoreLeft;
                        dw.top = state.restoreTop;
                        dw.width = state.restoreWidth;
                        dw.height = state.restoreHeight;
                        dw.setPosition(state.left + "px", state.top + "px");
                        dw.setSize(state.width + "px", state.height + "px");
                        if (dw.minimizedState || dw.maximizedState) {
                            document.getElementById(dw.idWindowTemplate).style.setProperty("resize", "none");
                            document.getElementById(dw.idWindowDraggableArea).style.setProperty("cursor", "default");
                        }
                        else {
                            document.getElementById(dw.idWindowTemplate).style.setProperty("resize", "both");
                            document.getElementById(dw.idWindowDraggableArea).style.setProperty("cursor", "move");
                        }
                    }
                });
            }
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
            return { x: this.dw.offsetLeft, y: this.dw.offsetTop };
        }
        getSize() {
            return { w: this.dw.clientWidth, h: this.dw.clientHeight };
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
            this.removeFromWindowList();
            return this;
        }
        minimize(atPosition = false) {
            this.saveState();
            this.dw.style.height = this.MINIMIZED_HEIGHT;
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
                }
                else {
                    minTop = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - (this.CAPTION_HEIGHT + 1);
                }
                const left = this.findAvailableMinimizedSlot(minTop);
                // Force minimized window when moving to bottom to have a fixed width.
                this.dw.style.width = this.MINIMIZED_WIDTH;
                this.dw.style.top = minTop + "px";
                this.dw.style.left = left + "px";
            }
            this.dw.style.setProperty("resize", "none");
            document.getElementById(this.idWindowDraggableArea).style.setProperty("cursor", "default");
            return this;
        }
        maximize() {
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
            this.maximizedState = true;
            this.minimizedState = false;
            this.dw.style.setProperty("resize", "none");
            document.getElementById(this.idWindowDraggableArea).style.setProperty("cursor", "default");
            return this;
        }
        restore() {
            this.restoreState();
            this.minimizedState = false;
            this.maximizedState = false;
            return this;
        }
        removeFromWindowList() {
            const idx = DivWindow.divWindows.findIndex(dw => dw.idWindowTemplate === this.idWindowTemplate);
            if (idx !== -1) {
                // Note that splice modifies the array in place and returns a new array containing the elements that have been removed.
                DivWindow.divWindows.splice(idx, 1);
            }
        }
        isContained() {
            const el = this.dw.parentElement.parentElement;
            const www = el.localName !== "body";
            return www;
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
            this.dw.style.setProperty("resize", "both");
            document.getElementById(this.idWindowDraggableArea).style.setProperty("cursor", "move");
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
                .map(n => parseInt(window.document.defaultView.getComputedStyle(n).getPropertyValue("z-index"))));
            this.dw.style.setProperty("z-index", (maxz + 1).toString());
        }
        getDivWindows(useDocument = false) {
            const el = this.dw.parentElement.parentElement;
            const els = ((el.localName === "body" || useDocument) ? document : el).querySelectorAll("[divWindow]");
            return els;
        }
        onDraggableAreaMouseDown(e) {
            // Should not be draggable but we'll check anyways.
            if (!this.minimizedState && !this.maximizedState) {
                this.updateZOrder();
                this.startDrag(e);
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
            return { x: dwx, y: dwy };
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
            if (options.left) {
                this.x = options.left;
            }
            if (options.top) {
                this.y = options.top;
            }
            if (options.width) {
                this.w = options.width;
            }
            if (options.height) {
                this.h = options.height;
            }
            if (options.color) {
                this.setColor(options.color);
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
    exports.DivWindow = DivWindow;
    DivWindow.divWindows = [];
});
//# sourceMappingURL=divWindow.js.map