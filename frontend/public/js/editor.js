class point {
    constructor(x, y) {
        this.x = x !== null && x !== void 0 ? x : 0;
        this.y = y !== null && y !== void 0 ? y : 0;
    }
    add(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    }
    subtract(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    }
    multiply(n) {
        this.x *= n;
        this.y *= n;
        return this;
    }
    copy() { return new point(this.x, this.y); }
    static copy(p) { return new point(p.x, p.y); }
    static add(p1, p2) { return new point(p1.x + p2.x, p1.y + p2.y); }
    static subtract(p1, p2) { return new point(p1.x - p2.x, p1.y - p2.y); }
    static multiply(p1, n) { return new point(p1.x * n, p1.y * n); }
    static center(p1, p2) { return new point(((p1.x + p2.x) / 2), ((p1.y + p2.y) / 2)); }
    static dotP(p1, p2) { return p1.x * p2.x + p1.y * p2.y; }
    static unit(p) {
        let s = Math.sqrt(p.x * p.x + p.y * p.y);
        return new point(p.x / s, p.y / s);
    }
}
point.zero = new point(0, 0);
function makeSVGElement(tag, attrs) {
    let el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (let k in attrs) {
        el.setAttribute(k, attrs[k]);
    }
    return el;
}
class svgCurve {
    constructor(element, start, end) {
        this.events = new Array();
        this.element = element;
        this.start = start;
        this.end = end;
        this.center = point.add(this.start, this.end).multiply(1 / 2);
        this.startControl = new point((this.start.x + this.center.x) / 2, this.start.y);
        this.endControl = new point((this.end.x + this.center.x) / 2, this.end.y);
        this.recalc();
    }
    setStart(p) {
        let oldStart = this.start;
        this.start = p;
        this.proportionalAdjustControls(oldStart, this.end);
        this.restrictControlPoints();
        this.recalc();
    }
    setStartControl(p) {
        this.startControl = p;
        this.startControl.x = Math.max(this.startControl.x, this.start.x);
        this.restrictControlPoints();
        this.recalc();
    }
    setEndControl(p) {
        this.endControl = p;
        this.endControl.x = Math.min(this.endControl.x, this.end.x);
        this.restrictControlPoints();
        this.recalc();
    }
    setEnd(p) {
        let oldEnd = this.end;
        this.end = p;
        this.proportionalAdjustControls(this.start, oldEnd);
        this.restrictControlPoints();
        this.recalc();
    }
    proportionalAdjustControls(oldStart, oldEnd) {
        if (this.start.y != this.end.y) {
            this.startControl.x = (((this.startControl.x - oldStart.x) / (oldEnd.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x);
            this.startControl.y = (((this.startControl.y - oldStart.y) / (oldEnd.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y);
            this.endControl.x = (((this.endControl.x - oldStart.x) / (oldEnd.x - oldStart.x)) * (this.end.x - this.start.x) + this.start.x);
            this.endControl.y = (((this.endControl.y - oldStart.y) / (oldEnd.y - oldStart.y)) * (this.end.y - this.start.y) + this.start.y);
        }
    }
    restrictControlPoints() {
        if (this.start.y < this.end.y && this.start.x < this.end.x) {
            this.startControl.y = Math.min(this.startControl.y, this.start.y);
            this.endControl.y = Math.max(this.endControl.y, this.end.y);
        }
        else {
            this.startControl.y = Math.max(this.startControl.y, this.start.y);
            this.endControl.y = Math.min(this.endControl.y, this.end.y);
        }
        let leftRightBuffer = 10;
        this.startControl.x = Math.max(this.startControl.x, this.start.x + leftRightBuffer);
        this.endControl.x = Math.min(this.endControl.x, this.end.x - leftRightBuffer);
    }
    getStart() {
        return (this.start);
    }
    getC1() { return this.startControl; }
    getCenter() { return this.center; }
    getC2() { return this.endControl; }
    getEnd() { return this.end; }
    calcCenter() {
        let d = [[this.start, this.end], [this.startControl, this.endControl]];
        let a0 = (d[0][0].y - d[0][1].y) / (d[0][0].x - d[0][1].x);
        let a1 = (d[1][0].y - d[1][1].y) / (d[1][0].x - d[1][1].x);
        let b0 = d[0][0].y - a0 * d[0][0].x;
        let b1 = d[1][0].y - a1 * d[1][0].x;
        let x = (b0 - b1) / (a1 - a0);
        let y = a0 * x + b0;
        if (x != x || y != y) {
            return point.add(this.start, this.end).multiply(1 / 2);
        }
        else {
            return new point(x, y);
        }
    }
    recalc() {
        this.onUpdate();
        this.center = this.calcCenter();
        this.element.setAttribute("d", this.getSVGData());
    }
    getSVGData() {
        return (" M " + this.start.x + " " + this.start.y +
            " C " + this.startControl.x + " " + this.startControl.y +
            " , " + this.startControl.x + " " + this.startControl.y +
            " , " + this.center.x + " " + this.center.y +
            " C " + " " + this.endControl.x + " " + this.endControl.y +
            " , " + " " + this.endControl.x + " " + this.endControl.y +
            " , " + this.end.x + " " + this.end.y);
    }
    onUpdate() {
        this.events.forEach(event => {
            event.callback(this);
        });
    }
    addEvent(id, callback) {
        this.events.push({ id, callback });
    }
}
function setSize(e, p) {
    e.style.width = p.x.toString() + "px";
    e.style.height = p.y.toString() + "px";
}
function download(data, filename, type) {
    var file = new Blob([data], { type: type });
    let a = document.createElement("a");
    let url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
}
function pageRectAdjust(rect) {
    rect.x += window.scrollX;
    rect.y += window.scrollY;
    return rect;
}
function getBoundingClientRectPage(e) {
    return pageRectAdjust(e.getBoundingClientRect());
}
class Graph {
}
var GraphType;
(function (GraphType) {
    GraphType[GraphType["Num"] = 0] = "Num";
    GraphType[GraphType["Text"] = 1] = "Text";
    GraphType[GraphType["Bool"] = 2] = "Bool";
    GraphType[GraphType["User"] = 3] = "User";
    GraphType[GraphType["Message"] = 4] = "Message";
    GraphType[GraphType["Time"] = 5] = "Time";
    GraphType[GraphType["Channel"] = 6] = "Channel";
    GraphType[GraphType["Category"] = 7] = "Category";
    GraphType[GraphType["Emoji"] = 8] = "Emoji";
    GraphType[GraphType["MessageType"] = 9] = "MessageType";
})(GraphType || (GraphType = {}));
class VPL_Plug extends HTMLElement {
    constructor() {
        super();
    }
}
class VPL_Node extends HTMLElement {
    constructor(Name, Actions, Inputs, Outputs, position, isEvent) {
        super();
        this.ID = 0;
        this.boundDragNode = (e) => { e.preventDefault(); this.dragNode.bind(this)(); };
        this.boundDragMove = (e) => { e.preventDefault(); this.dragMove.bind(this)(new point(e.pageX, e.pageY)); };
        this.boundStopDragNode = (e) => { e.preventDefault(); this.stopDragNode.bind(this)(); };
        this.IsEvent = isEvent !== null && isEvent !== void 0 ? isEvent : false;
        this.Name = Name;
        this.Actions = Actions;
        this.Inputs = Inputs;
        this.Outputs = Outputs;
        this.setPosition(position);
        this.classList.add("node");
        let headerDiv = document.createElement("div");
        headerDiv.classList.add("header");
        let headerText = document.createElement("p");
        headerText.innerText = Name;
        headerDiv.appendChild(headerText);
        headerDiv.addEventListener("mousedown", (e) => this.boundDragNode(e));
        this.appendChild(headerDiv);
        this.header = headerDiv;
        let bodyDiv = document.createElement("div");
        bodyDiv.classList.add("body");
        this.appendChild(bodyDiv);
        let inputListDiv = document.createElement("div");
        inputListDiv.classList.add("inputList");
        bodyDiv.appendChild(inputListDiv);
        let outputListDiv = document.createElement("div");
        outputListDiv.classList.add("outputList");
        bodyDiv.appendChild(outputListDiv);
        Actions.forEach(action => {
            action.ParentNode = this;
            let outputDiv = document.createElement("div");
            outputDiv.classList.add("output");
            let text = document.createElement("p");
            action.classList.add("typeDot", "action");
            action.addEventListener("mousedown", (e) => beginConnection(e, action));
            text.innerHTML = action.Name;
            outputDiv.appendChild(action);
            outputDiv.appendChild(text);
            outputListDiv.appendChild(outputDiv);
        });
        Inputs === null || Inputs === void 0 ? void 0 : Inputs.forEach(input => {
            input.ParentNode = this;
            let inputDiv = document.createElement("div");
            input.classList.add("typeDot", GraphType[input.Type]);
            inputDiv.appendChild(input);
            input.addEventListener("mousedown", (e) => beginConnection(e, input));
            inputListDiv.appendChild(inputDiv);
            inputDiv.classList.add("input");
            if (input.HasField) {
                let inputField = document.createElement("input");
                inputField.addEventListener("change", (e) => { input.Value = inputField.value; });
                inputField.placeholder = input.Name;
                inputDiv.appendChild(inputField);
            }
            else {
                let text = document.createElement("p");
                text.innerHTML = input.Name;
                inputDiv.appendChild(text);
            }
        });
        Outputs === null || Outputs === void 0 ? void 0 : Outputs.forEach(output => {
            output.ParentNode = this;
            let outputDiv = document.createElement("div");
            outputDiv.classList.add("output");
            let text = document.createElement("p");
            output.classList.add("typeDot", GraphType[output.Type]);
            output.addEventListener("mousedown", (e) => beginConnection(e, output));
            text.innerHTML = output.Name;
            outputDiv.appendChild(output);
            outputDiv.appendChild(text);
            outputListDiv.appendChild(outputDiv);
        });
    }
    VPL_Node_Type() {
        if (this instanceof ActionNode)
            return "ActionNode";
        if (this.IsEvent)
            return "EventNode";
        return "DataNode";
    }
    setPosition(p) {
        this.pos = p;
        this.setAttribute("style", "left: " + this.pos.x.toString() + "px;" + "top: " + this.pos.y.toString() + "px;");
    }
    getPosition() {
        return this.pos;
    }
    dragNode() {
        this.style.zIndex = "1";
        document.addEventListener("mouseup", this.boundStopDragNode);
        document.addEventListener("mousemove", this.boundDragMove);
    }
    dragMove(p) {
        this.oldPos = this.oldPos || p;
        let deltaX = this.oldPos.x - p.x;
        let deltaY = this.oldPos.y - p.y;
        this.oldPos = p;
        this.setPosition(new point((this.offsetLeft - deltaX), (this.offsetTop - deltaY)));
        this.Actions.forEach(p => {
            if (p.Connection != null) {
                let rect = getBoundingClientRectPage(p);
                let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
                p.Curve.setStart(pos);
            }
        });
        this.Inputs.forEach(p => {
            if (p.Connection != null) {
                let rect = getBoundingClientRectPage(p);
                let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
                p.Curve.setEnd(pos);
            }
        });
        this.Outputs.forEach(p => {
            p.Connections.forEach(destPlug => {
                let rect = getBoundingClientRectPage(p);
                let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
                destPlug.Curve.setStart(pos);
            });
        });
    }
    stopDragNode() {
        document.removeEventListener("mouseup", this.boundStopDragNode);
        document.removeEventListener("mousemove", this.boundDragMove);
        this.style.zIndex = null;
    }
}
class InPlug extends VPL_Plug {
    constructor(type, Name, HasField) {
        super();
        this.Connection = null;
        this.Name = Name !== null && Name !== void 0 ? Name : GraphType[type];
        this.Type = type;
        this.HasField = HasField !== null && HasField !== void 0 ? HasField : false;
    }
}
class OutPlug extends VPL_Plug {
    constructor(type, Name) {
        super();
        this.Connections = [];
        this.Name = Name !== null && Name !== void 0 ? Name : GraphType[type];
        this.Type = type;
    }
}
class ActionPlug extends VPL_Plug {
    constructor(Name) {
        super();
        this.Connection = null;
        this.Name = Name !== null && Name !== void 0 ? Name : "ACTION";
    }
}
class ActionNode extends VPL_Node {
    constructor(Name, Actions, Inputs, Outputs, position, isEvent) {
        super(Name, Actions, Inputs, Outputs, position, isEvent);
        this.Connections = [];
        this.classList.add("actionNode");
    }
    dragMove(p) {
        super.dragMove(p);
        this.Connections.forEach(c => {
            let rect = getBoundingClientRectPage(this.header);
            let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
            c.Curve.setEnd(pos);
        });
    }
}
class GraphEditor {
    constructor(container, bg, svgContainer, graph) {
        this.nodes = [];
        this.eventNodes = [];
        this.count = 0;
        customElements.define('vpl-action-plug', ActionPlug);
        customElements.define('vpl-in-plug', InPlug);
        customElements.define('vpl-out-plug', OutPlug);
        customElements.define('vpl-node', VPL_Node);
        customElements.define('vpl-action-node', ActionNode);
        bg.addEventListener("click", (e) => {
            e.preventDefault();
            this.spawnNode.bind(this)(new VPL_Node("TestNode" + (this.count++).toString(), [new ActionPlug("Next >>")], [new InPlug(GraphType.Num), new InPlug(GraphType.Text, "wow"), new InPlug(GraphType.Emoji), new InPlug(GraphType.Time)], [new OutPlug(GraphType.Num), new OutPlug(GraphType.Time), new OutPlug(GraphType.Text)], new point(e.pageX, e.pageY)));
        });
        this.container = container;
        this.svgContainer = svgContainer;
        window.addEventListener("resize", (e) => {
            let editorSize = new point(Math.max(document.body.clientWidth, ...this.nodes.map((n) => n.getPosition().x + 200)), Math.max(document.body.clientHeight, ...this.nodes.map((n) => n.getPosition().y + 200)));
            setSize(container, editorSize);
            setSize(bg, editorSize);
            setSize(svgContainer, editorSize);
        });
        document.addEventListener("keyup", (e) => {
            e.preventDefault();
            if (e.key === 'Enter') {
                download(this.jsonTranspile(), `${this.name}.json`, 'text/json');
            }
            if (e.key === 'p') {
                fetch('./backend/addJSON', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: this.jsonTranspile()
                });
            }
        });
    }
    spawnNode(n) {
        n.ID = ++this.count;
        this.container.appendChild(n);
        this.nodes.push(n);
        if (n.IsEvent) {
            this.eventNodes.push(n);
        }
    }
    jsonTranspile() {
        let todoStack = [...this.eventNodes];
        let doneStack = [];
        while (todoStack.length > 0) {
            let curr = todoStack.pop();
            curr.Actions.forEach((a) => a.Connection ? (doneStack.indexOf(a.Connection) == -1 ? todoStack.push(a.Connection) : "") : "");
            curr.Inputs.forEach((a) => a.Connection ? (doneStack.indexOf(a.Connection.ParentNode) == -1 ? todoStack.push(a.Connection.ParentNode) : "") : "");
            doneStack.push(curr);
        }
        return `
{ 
    "nodes": [ 
        ${doneStack.map((n) => `{
            "id": ${n.ID},
            "name": "${n.Name}",
            "type": "${n.VPL_Node_Type()}",
            "inputs":  
            { 
                "data": [ 
                    ${n.Inputs.map((a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}",
                        "valueIsPath": ${a.Connection !== null},
                        "value": ${a.Connection === null ? (a.HasField ? a.Value.toString() : "null") : `
                        {
                            "node": ${a.Connection.ParentNode.ID},
                            "plug": "${a.Connection.Name}"
                        }`}
                    }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0))} ${curr}`, "")}
                ],
                "actions": [ 
                    ${n.Actions.map((a) => `
                    {
                        "name": "${a.Name}",
                        "type": "Action",
                        "valueIsPath": ${a.Connection !== null},
                        "value": ${a.Connection === null ? "null" : `
                        {
                            "node": ${a.Connection.ID},
                            "plug": "${a.Connection.Name}"
                        }`}
                    }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0))} ${curr}`, "")}
                ]
            },
            "outputs":  
            { 
                "data": [ 
                    ${n.Outputs.map((a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}"
                    }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0))} ${curr}`, "")}
                ]
            }
        }`).reduce((prev, curr, i) => `${prev}${','.repeat((i > 0))} ${curr}`, "")}
    ]
}`;
    }
}
function beginConnection(e, fromPlug) {
    e.preventDefault();
    let rect = getBoundingClientRectPage(fromPlug);
    let curveSVG = makeSVGElement("path", { "fill": "none", "stroke": window.getComputedStyle(fromPlug).backgroundColor, "stroke-width": 4 });
    this.svgContainer.appendChild(curveSVG);
    let from = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
    let to = new point(e.pageX, e.pageY);
    let center = point.add(from, to).multiply(1 / 2);
    let fromControl = new point(center.x, from.y);
    let toControl = new point(center.x, to.y);
    if (fromPlug instanceof OutPlug) {
        let curve = new svgCurve(curveSVG, from, to);
        let dragConnection = (e) => {
            to = new point(e.pageX, e.pageY);
            center = point.add(from, to).multiply(1 / 2);
            fromControl = new point(center.x, from.y);
            toControl = new point(center.x, to.y);
            curve.setEnd(to);
            curve.setStartControl(fromControl);
            curve.setEndControl(toControl);
        };
        let stopConnection = (e) => {
            document.removeEventListener("mousemove", dragConnection);
            document.removeEventListener("mouseup", stopConnection);
            let targetPlug = e.target;
            while (targetPlug && !(targetPlug instanceof VPL_Plug)) {
                targetPlug = targetPlug.parentNode;
            }
            if (!targetPlug || !(targetPlug instanceof InPlug) || (targetPlug.Type != fromPlug.Type)) {
                curveSVG.remove();
                return;
            }
            targetPlug.Connection = fromPlug;
            fromPlug.Connections.push(targetPlug);
            targetPlug.Curve = curve;
            fromPlug.Curve = curve;
            addDots(curve);
        };
        document.addEventListener("mousemove", dragConnection);
        stopConnection = stopConnection.bind(this);
        document.addEventListener("mouseup", stopConnection);
    }
    else if (fromPlug instanceof InPlug) {
        let curve = new svgCurve(curveSVG, to, from);
        let dragConnection = (e) => {
            to = new point(e.pageX, e.pageY);
            center = point.add(from, to).multiply(1 / 2);
            fromControl = new point(center.x, from.y);
            toControl = new point(center.x, to.y);
            curve.setStart(to);
            curve.setStartControl(toControl);
            curve.setEndControl(fromControl);
        };
        let stopConnection = (e) => {
            document.removeEventListener("mousemove", dragConnection);
            document.removeEventListener("mouseup", stopConnection);
            let targetPlug = e.target;
            while (targetPlug && !(targetPlug instanceof VPL_Plug)) {
                targetPlug = targetPlug.parentNode;
            }
            if (!targetPlug || !(targetPlug instanceof OutPlug) || (targetPlug.Type != fromPlug.Type)) {
                curveSVG.remove();
                return;
            }
            fromPlug.Connection = targetPlug;
            targetPlug.Connections.push(fromPlug);
            targetPlug.Curve = curve;
            fromPlug.Curve = curve;
            addDots(curve);
        };
        document.addEventListener("mousemove", dragConnection);
        stopConnection = stopConnection.bind(this);
        document.addEventListener("mouseup", stopConnection);
    }
    else if (fromPlug instanceof ActionPlug) {
        let curve = new svgCurve(curveSVG, from, to);
        let dragConnection = (e) => {
            to = new point(e.pageX, e.pageY);
            center = point.add(from, to).multiply(1 / 2);
            fromControl = new point(center.x, from.y);
            toControl = new point(center.x, to.y);
            curve.setEnd(to);
            curve.setStartControl(fromControl);
            curve.setEndControl(toControl);
        };
        let stopConnection = (e) => {
            document.removeEventListener("mousemove", dragConnection);
            document.removeEventListener("mouseup", stopConnection);
            let target = e.target;
            while (target != undefined && !(target instanceof VPL_Node)) {
                target = target.parentNode;
            }
            if (!target || !(target instanceof ActionNode)) {
                curveSVG.remove();
                return;
            }
            fromPlug.Connection = target;
            target.Connections.push(fromPlug);
            target.Curve = curve;
            fromPlug.Curve = curve;
            addDots(curve);
            target.classList.add("actionConnected");
        };
        document.addEventListener("mousemove", dragConnection);
        stopConnection = stopConnection.bind(this);
        document.addEventListener("mouseup", stopConnection);
    }
    else {
        throw new Error("Started connection on unknown plug type");
    }
    function addDots(curve) {
        let dots = [
            { setter: curve.setStart.bind(curve), getter: curve.getStart.bind(curve), element: makeSVGElement("circle", { "fill": "yellow", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setStartControl.bind(curve), getter: curve.getC1.bind(curve), element: makeSVGElement("circle", { "fill": "orange", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setEndControl.bind(curve), getter: curve.getC2.bind(curve), element: makeSVGElement("circle", { "fill": "purple", "r": 5, "pointer-events": "all" }) },
            { setter: curve.setEnd.bind(curve), getter: curve.getEnd.bind(curve), element: makeSVGElement("circle", { "fill": "blue", "r": 5, "pointer-events": "all" }) }
        ];
        curve.addEvent("updateshit", (curve) => {
            dots.forEach(dot => {
                dot.element.setAttribute("cx", dot.getter().x.toString());
                dot.element.setAttribute("cy", dot.getter().y.toString());
            });
        });
        let handleDotWrapper = function (dot) {
            dot.element.setAttribute("cx", dot.getter().x.toString());
            dot.element.setAttribute("cy", dot.getter().y.toString());
            let handleDot = function (_) {
                let dragDot = function (e) {
                    dot.setter(new point(e.pageX, e.pageY));
                    dot.element.setAttribute("cx", dot.getter().x.toString());
                    dot.element.setAttribute("cy", dot.getter().y.toString());
                };
                let releaseDot = function (_) {
                    document.removeEventListener("mousemove", dragDot);
                    document.removeEventListener("mouseup", releaseDot);
                };
                document.addEventListener("mousemove", dragDot);
                document.addEventListener("mouseup", releaseDot);
            };
            dot.element.addEventListener("mousedown", handleDot);
        };
        dots.forEach(dot => {
            handleDotWrapper(dot);
            this.svgContainer.appendChild(dot.element);
        });
    }
}
let windowSize = new point(document.body.clientWidth, document.body.clientHeight);
let container = document.getElementById('container');
setSize(container, windowSize);
let bg = document.getElementById('bg');
setSize(bg, windowSize);
let svgContainer = document.getElementById('svgContainer');
setSize(svgContainer, windowSize);
let e = new GraphEditor(container, bg, svgContainer, new Graph());
