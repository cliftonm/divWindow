class DivWindowPosition {
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

    // inline block automatically sizes the div the the extents of the inner content.
    // https://stackoverflow.com/a/33026219
    protected template = '\
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
    constructor(id: string, options?: DivWindowOptions) {
        this.setupIDs(id);
        this.options = options ?? new DivWindowOptions();
        const win = document.getElementById(id);
        const caption = win.getAttribute("caption");
        const startingHtml = win.innerHTML;

        win.innerHTML = this.template.replace(/{w}/g, id);
        this.dw = document.getElementById(this.idWindowTemplate) as HTMLDivElement;
        this.dwc = document.getElementById(this.idCaptionBar) as HTMLDivElement;
        this.dwc.onmousedown = e => this.onMouseDown(e);
        document.getElementById(this.idWindowContent).innerHTML = startingHtml;

        this.configure(options);
        this.setCaption(caption);
    }

    public setCaption(caption: string): void {
        document.getElementById(this.idWindowCaption).innerHTML = caption;
    }

    public setColor(color: string): void {
        this.dw.style.setProperty("border", `1px solid ${color}`);
        this.dwc.style.setProperty("background-color", color);
    }

    public setContent(html: string): void {
        document.getElementById(this.idWindowContent).innerHTML = html;
    }

    public getPosition(): DivWindowPosition {
        return new DivWindowPosition(this.dw.offsetLeft, this.dw.offsetTop);
    }

    public getSize(): DivWindowSize {
        return new DivWindowSize(this.dw.clientWidth, this.dw.clientHeight);
    }

    public setPosition(x: string, y: string): void {
        this.dw.style.left = x;
        this.dw.style.top = y;
    }

    public setSize(w: string, h: string): void {
        this.dw.style.width = w;
        this.dw.style.height = h;
    }

    public setWidth(w: string): void {
        this.dw.style.width = w;
    }

    public setHeight(h: string): void {
        this.dw.style.height = h;
    }

    public close(): void {
        this.dw.remove();
    }

    public minimize(atPosition = false): void {
        this.saveState();
        this.dw.style.height = "23px";
        this.dw.style.setProperty("resize", "none");
        this.minimizedState = true;
        this.maximizedState = false;

        if (this.options.moveMinimizedToBottom && !atPosition) {
            const minTop = (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight) - 25;
            const left = this.findAvailableMinimizedSlot(minTop);

            // Force minimized window when moving to bottom to have a fixed width.
            this.dw.style.width = "200px";      
            this.dw.style.top = minTop + "px";
            this.dw.style.left = left + "px";

            // Should we disable dragging when minimized at the bottom?
        }
    }

    public maximize(): void {
        this.saveState();
        this.dw.style.left = "3px";
        this.dw.style.top = "3px";
        this.dw.style.width = "99%"; 
        this.dw.style.height = "99%";
        this.dw.style.setProperty("resize", "none");
        this.maximizedState = true;
        this.minimizedState = false;
    }

    public restore(): void {
        this.restoreState();
        this.dw.style.setProperty("resize", "both");
        this.minimizedState = false;
        this.maximizedState = false;
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
    }

    protected minimizeRestore(): void {
        this.minimizedState ? this.restore() : this.minimize();
    }

    protected maximizeRestore(): void {
        this.maximizedState ? this.restore() : this.maximize();
    }

    protected updateZOrder(): void {
        const nodes = document.querySelectorAll("[divWindow]");
        const maxz = Math.max(
            ...Array.from(nodes)
                .map(n =>
                    parseInt(window.document.defaultView.getComputedStyle(n).getPropertyValue('z-index'))
                ));
        this.dw.style.setProperty("z-index", (maxz + 1).toString());
    }

    protected onMouseDown(e: MouseEvent): void {
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
        } else if (this.options.hasClose && e.clientX >= this.dw.offsetLeft + dot1.offsetLeft && e.clientX <= this.dw.offsetLeft + dot1.offsetLeft + 10) {
            this.close();
        } else if (this.options.hasMinimize && e.clientX >= this.dw.offsetLeft + dot2.offsetLeft && e.clientX <= this.dw.offsetLeft + dot2.offsetLeft + 10) {
            this.minimizeRestore();
        } else if (this.options.hasMaximize && e.clientX >= this.dw.offsetLeft + dot3.offsetLeft && e.clientX <= this.dw.offsetLeft + dot3.offsetLeft + 10) {
            this.maximizeRestore();
        }
    }

    protected onMouseUp(e: MouseEvent): void {
        this.stopDrag();
    }

    protected onMouseMove(e: MouseEvent): void {
        const dx = this.mx - e.clientX;
        const dy = this.my - e.clientY;

        // offsetLeft and offsetTop are numbers, whereas dw.style.left/top is a string.
        // But interestingly, offsetLeft and offsetTop are read-only properties!
        this.dw.style.left = this.dw.offsetLeft - dx + "px";
        this.dw.style.top = this.dw.offsetTop - dy + "px";
        this.updateMousePosition(e);
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
        const nodes = document.querySelectorAll("[divWindow]");

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
    new DivWindow("window1");
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
};
