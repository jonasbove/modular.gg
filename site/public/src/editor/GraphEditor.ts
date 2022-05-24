/// <reference path="Stuff.ts" />

class Graph {
  name: string;
  nodes: VPL_Node[] = [];
  event: EventNode;
}

enum GraphType {
  Num,
  Text,
  Bool,
  User,
  Message,
  Time,
  Channel,
  Category,
  Emoji,
  MessageType,
}

abstract class VPL_Plug extends HTMLElement {
  ParentNode: VPL_Node;
  Name: string;
  Curve: svgCurve;

  constructor() {
    super();
  }
}

class VPL_Node extends HTMLElement {
  VPL_Node_Type(): string {
    if (this instanceof ActionNode) return "ActionNode";

    if (this instanceof EventNode)
      //Again, this probably would be "better" as a bool, but this fits the pattern better
      return "EventNode";

    return "DataNode";
  }

  protected pos: point;

  header: HTMLDivElement; //TODO: maybe expose the other htmlelements as members too?

  Name: string;
  Inputs: InPlug[];
  Outputs: OutPlug[];
  Actions: ActionPlug[];
  ID: number = 0;

  constructor(
    Name: string,
    Actions: ActionPlug[],
    Inputs: InPlug[],
    Outputs: OutPlug[],
    position: point,
    onPlugClick: (
      e: MouseEvent,
      p: VPL_Plug
    ) => void /*This feels a bit out of place, but given we're doing this with events, I guess we need this*/
  ) {
    super();
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

    Actions.forEach((action) => {
      action.ParentNode = this;
      let outputDiv = document.createElement("div");
      outputDiv.classList.add("output");
      let text = document.createElement("p");
      action.classList.add("typeDot", "action");
      action.addEventListener("mousedown", (e) => onPlugClick(e, action));

      text.innerText = action.Name;
      outputDiv.appendChild(action);
      outputDiv.appendChild(text);
      outputListDiv.appendChild(outputDiv);
    });

    Inputs?.forEach((input) => {
      input.ParentNode = this;
      let inputDiv = document.createElement("div");
      input.classList.add("typeDot", GraphType[input.Type]);
      inputDiv.appendChild(input);
      input.addEventListener("mousedown", (e) => onPlugClick(e, input));
      inputListDiv.appendChild(inputDiv);
      inputDiv.classList.add("input");

      if (input.HasField) {
        let inputField = document.createElement("input") as HTMLInputElement;
        inputField.addEventListener("change", (e) => {
          input.Value = inputField.value;
        }); //TODO: implement an actual input parsing function, maybe even do drop downs as opposed to text fields for some types?
        inputField.placeholder = input.Name;
        inputDiv.appendChild(inputField);
      } else {
        let text = document.createElement("p");
        text.innerText = input.Name;
        inputDiv.appendChild(text);
      }
    });

    Outputs?.forEach((output) => {
      output.ParentNode = this;
      let outputDiv = document.createElement("div");
      outputDiv.classList.add("output");
      let text = document.createElement("p");
      output.classList.add("typeDot", GraphType[output.Type]);
      output.addEventListener("mousedown", (e) => onPlugClick(e, output));

      text.innerText = output.Name;
      outputDiv.appendChild(output);
      outputDiv.appendChild(text);
      outputListDiv.appendChild(outputDiv);
    });
  }

  setPosition(p: point): void {
    this.pos = p;
    this.setAttribute(
      "style",
      "left: " +
        this.pos.x.toString() +
        "px;" +
        "top: " +
        this.pos.y.toString() +
        "px;"
    );
  }

  getPosition(): point {
    return this.pos;
  }

  protected oldPos: point; //TODO: don't like this being a member fo the class, but it's needed in multiple funcitons... Maybe make it a parameter? But then I'd need wrappers because they're events. WHat to do, what to do...
  protected dragNode() {
    //https://www.w3schools.com/howto/howto_js_draggable.asp
    this.style.zIndex = "1";

    document.addEventListener("mouseup", this.boundStopDragNode);
    document.addEventListener("mousemove", this.boundDragMove);
  }

  protected dragMove(p: point) {
    this.oldPos = this.oldPos || p; //Short circuit evaluation to assign oldPos to p in case of no previous value
    let deltaX = this.oldPos.x - p.x;
    let deltaY = this.oldPos.y - p.y;
    this.oldPos = p;

    this.setPosition(
      new point(this.offsetLeft - deltaX, this.offsetTop - deltaY)
    );

    this.Actions.forEach((p) => {
      if (p.Connection != null) {
        let rect = getBoundingClientRectPage(p);
        let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);

        p.Curve.setStart(pos);
      }
    });

    this.Inputs.forEach((p) => {
      if (p.Connection != null) {
        let rect = getBoundingClientRectPage(p);
        let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);

        p.Curve.setEnd(pos);
      }
    });

    this.Outputs.forEach((p) => {
      p.Connections.forEach((destPlug) => {
        let rect = getBoundingClientRectPage(p);
        let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);

        destPlug.Curve.setStart(pos);
      });
    });
  }

  protected stopDragNode() {
    document.removeEventListener("mouseup", this.boundStopDragNode);
    document.removeEventListener("mousemove", this.boundDragMove);
    this.style.zIndex = null;
  }

  private boundDragNode = (e: MouseEvent) => {
    e.preventDefault();
    this.dragNode.bind(this)();
  };
  private boundDragMove = (e: MouseEvent) => {
    e.preventDefault();
    this.dragMove.bind(this)(new point(e.pageX, e.pageY));
  };
  private boundStopDragNode = (e: MouseEvent) => {
    e.preventDefault();
    this.stopDragNode.bind(this)();
  };
}

class EventNode extends VPL_Node {} //Really does nothing and is probably more effecient as a bool, but this fits the overall design pattern better

class InPlug extends VPL_Plug {
  HasField: boolean;
  Type: GraphType;
  Connection: OutPlug = null;
  Value: any = "null";

  constructor(type: GraphType, Name?: string, HasField?: boolean) {
    super();
    this.Name = Name ?? GraphType[type];
    this.Type = type;
    this.HasField = HasField ?? false;
  }
}

class OutPlug extends VPL_Plug {
  Type: GraphType;
  Connections: InPlug[] = [];

  constructor(type: GraphType, Name?: string) {
    super();
    this.Name = Name ?? GraphType[type];
    this.Type = type;
  }
}

class ActionPlug extends VPL_Plug {
  Connection: ActionNode = null;

  constructor(Name?: string) {
    super();
    this.Name = Name ?? "ACTION";
  }
}

class ActionNode extends VPL_Node {
  Connections: ActionPlug[] = [];
  Curve: svgCurve;

  constructor(
    Name: string,
    Actions: ActionPlug[],
    Inputs: InPlug[],
    Outputs: OutPlug[],
    position: point,
    onPlugClick: (e: MouseEvent, p: VPL_Plug) => void
  ) {
    super(Name, Actions, Inputs, Outputs, position, onPlugClick);
    this.classList.add("actionNode");
  }

  protected dragMove(p: point) {
    super.dragMove(p);

    this.Connections.forEach((c) => {
      let rect = getBoundingClientRectPage(this.header);
      let pos = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);

      c.Curve.setEnd(pos);
    });
  }
}

class GraphEditor {
  container: HTMLElement;
  titleHeader: HTMLHeadingElement;
  svgContainer: SVGElement;
  currentGraph: Graph;
  savedGraphs: Graph[] = []; //Maybe have this be a Graph[] or maybe change it to an array of some way to query for a Graph instead
  count = 0;

  constructor(container: HTMLElement, svgContainer: SVGElement) {
    //-This is a shitty meme, god i hate this, whoever decided tot do this, did way more than a 'little bit' of trolling
    //customElements.define('vpl-plug', VPL_Plug);
    customElements.define("vpl-action-plug", ActionPlug);
    customElements.define("vpl-in-plug", InPlug);
    customElements.define("vpl-out-plug", OutPlug);
    customElements.define("vpl-event-node", EventNode);
    customElements.define("vpl-node", VPL_Node);
    customElements.define("vpl-action-node", ActionNode);

    this.container = container;
    this.svgContainer = svgContainer;

    window.addEventListener("resize", (e) => {
      let editorSize = new point(
        Math.max(
          document.body.clientWidth,
          ...this.currentGraph.nodes.map((n) => n.getPosition().x + 200)
        ),
        Math.max(
          document.body.clientHeight,
          ...this.currentGraph.nodes.map((n) => n.getPosition().y + 200)
        )
      ); //TODO: less arbitrary numbers for with/height of nodes

      setSize(container, editorSize);
      setSize(svgContainer, editorSize);
    });

    //Load menus
    let dataNodeMenu = document.createElement("div");
    dataNodeMenu.classList.add("menu");
    dataNodeMenu.style.display = "none";
    fetch("./assets/JSON/dataNodes.json") //TODO: Make this dependency explicit
      .then((r) => r.json())
      .then((nodes) =>
        nodes.forEach((n) => {
          let button = document.createElement("div");
          button.innerText = n.humanName;
          button.title = n.description;
          button.classList.add("button");
          button.addEventListener("mousedown", (_) => {
            this.spawnNode(
              new VPL_Node(
                n.name,
                n.ActionPlugs.map((des) => new ActionPlug(des.name)),
                n.InPlugs.map(
                  (des) =>
                    new InPlug(
                      GraphType[des.type as string],
                      des.name,
                      des.field
                    )
                ),
                n.OutPlugs.map(
                  (des) => new OutPlug(GraphType[des.type as string], des.name)
                ),
                new point(250, 175),
                beginConnection.bind(this)
              )
            );
            toggleVisibility(dataNodeMenu, "flex");
          });
          dataNodeMenu.appendChild(button);
        })
      );

    let dataNodeButton = document.createElement("div");
    dataNodeButton.innerText = "Insert Data";
    dataNodeButton.classList.add("button");
    dataNodeButton.addEventListener("mousedown", (_) =>
      toggleVisibility(dataNodeMenu, "flex")
    );

    let actionNodeMenu = document.createElement("div");
    actionNodeMenu.classList.add("menu");
    actionNodeMenu.style.display = "none";
    fetch("./assets/JSON/actionNodes.json") //TODO: Make this dependency explicit
      .then((r) => r.json())
      .then((nodes) =>
        nodes.forEach((n) => {
          let button = document.createElement("div");
          button.innerText = n.humanName;
          button.title = n.description;
          button.classList.add("button");
          button.addEventListener("mousedown", (_) => {
            this.spawnNode(
              new ActionNode(
                n.name,
                n.ActionPlugs.map((des) => new ActionPlug(des.name)),
                n.InPlugs.map(
                  (des) =>
                    new InPlug(
                      GraphType[des.type as string],
                      des.name,
                      des.field
                    )
                ),
                n.OutPlugs.map(
                  (des) => new OutPlug(GraphType[des.type as string], des.name)
                ),
                new point(250, 175),
                beginConnection.bind(this)
              )
            );
            toggleVisibility(actionNodeMenu, "flex");
          });
          actionNodeMenu.appendChild(button);
        })
      );

    let actionNodeButton = document.createElement("div");
    actionNodeButton.innerText = "Insert Action";
    actionNodeButton.classList.add("button");
    actionNodeButton.addEventListener("mousedown", (_) =>
      toggleVisibility(actionNodeMenu, "flex")
    );

    let actionSection = document.createElement("div");
    let dataSection = document.createElement("div");
    actionSection.classList.add("menuWrapper");
    dataSection.classList.add("menuWrapper");

    actionSection.appendChild(actionNodeButton);
    actionSection.appendChild(actionNodeMenu);
    dataSection.appendChild(dataNodeButton);
    dataSection.appendChild(dataNodeMenu);

    this.titleHeader = document.createElement("h1");
    this.titleHeader.innerText = this.currentGraph?.name;

    const top_nav = document.querySelector("#top-nav"); //TODO: Make this dependency explicit
    top_nav.appendChild(this.titleHeader);
    top_nav.appendChild(actionSection);
    top_nav.appendChild(dataSection);

    //TODO: Load saved graph from database
    this.loadSavesMenu();
    //End load menus

    if (this.savedGraphs.length > 0) {
      this.currentGraph = this.savedGraphs[0];
    } else {
      this.makeNewGraph();
    }
  }

  loadSavesMenu() {
    const side_nav = document.querySelector("#side-nav"); //TODO: Make this dependency explicit
    side_nav.innerHTML = "";

    let newGraphButton = document.createElement("div");
    newGraphButton.classList.add("button");
    newGraphButton.innerText = "+";
    newGraphButton.addEventListener("mousedown", (_) =>
      alert(
        "This feature is still a work in progress and will become available at a later time"
      )
    );

    //TODO: make is so the curves are reloaded on changing save
    //TODO: implement saving with databse
    //newGraphButton.addEventListener("mousedown", (_) => this.makeNewGraph())

    side_nav.appendChild(newGraphButton);

    this.savedGraphs.forEach((graph) => {
      let graphButton = document.createElement("div");
      graphButton.classList.add("button");
      graphButton.innerText = graph.name;
      graphButton.addEventListener("mousedown", (_) => this.loadGraph(graph));
      side_nav.appendChild(graphButton);
    });
  }

  makeNewGraph() {
    let g = new Graph();

    let popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = "New Graph";
    let textbox = document.createElement("input");
    textbox.placeholder = "Graph Name";

    let button = document.createElement("div");
    button.classList.add("button");
    button.innerText = "OKAY!";
    popup.appendChild(textbox);
    popup.appendChild(button);
    button.addEventListener("mousedown", (_) => {
      actualMakeNewGraph(
        textbox.value,
        new EventNode(
          "OnSlashCommand",
          [new ActionPlug("next")],
          [
            new InPlug(GraphType.Text, "trigger", true),
            new InPlug(GraphType.Text, "description", true),
          ],
          [new OutPlug(GraphType.Channel, "channel")],
          new point(250, 175),
          beginConnection.bind(this)
        )
      );
      document.body.removeChild(popup);
    });
    document.body.appendChild(popup);

    let actualMakeNewGraph = function (name: string, event: EventNode) {
      g.name = name;
      this.loadGraph(g);
      this.spawnNode(event);
      //this.spawnNode(new EventNode("OnSlashCommand", [new ActionPlug("next")], [new InPlug(GraphType.Text, "trigger", true)], [new OutPlug(GraphType.Channel, "channel")], new point(250, 175), beginConnection.bind(this)))

      this.savedGraphs.push(g);
      this.loadSavesMenu();
    }.bind(this);
  }

  loadGraph(graph: Graph) {
    this.titleHeader.innerText = graph.name;
    let svgContainer = this.svgContainer;
    this.container.innerHTML = "";
    this.container.appendChild(svgContainer);
    this.svgContainer.innerHTML = "";
    this.currentGraph = graph;
    graph.nodes.forEach((n) => this.renderNode(n)); //TODO: add connections to this
  }

  spawnNode(n: VPL_Node) {
    n.ID = ++this.count;
    this.renderNode(n);
    this.currentGraph.nodes.push(n);
    if (n instanceof EventNode) {
      this.currentGraph.event = n;
    }
  }

  renderNode(n: VPL_Node) {
    this.container.appendChild(n);
  }

  jsonTranspile(): string {
    if (this.currentGraph?.event === null) {
      alert("Missing event node");
      throw new Error("Missing EventNode");
    }

    let todoStack: VPL_Node[] = [this.currentGraph.event]; //This doesn't need to be a collection anymore since we dropped support for multiple events per graph, but might as well keep it like this ¯\_(ツ)_/¯
    let doneStack: VPL_Node[] = [];

    while (todoStack.length > 0) {
      let curr = todoStack.pop();
      curr.Actions.forEach((a) =>
        a.Connection
          ? doneStack.indexOf(a.Connection) == -1
            ? todoStack.push(a.Connection)
            : ""
          : ""
      );
      curr.Inputs.forEach((a) =>
        a.Connection
          ? doneStack.indexOf(a.Connection.ParentNode) == -1
            ? todoStack.push(a.Connection.ParentNode)
            : ""
          : ""
      );
      doneStack.push(curr);
    }

    //TODO: loop detection
    return `
{ 
    "name": "${this.currentGraph.name}",
    "nodes": [ 
        ${doneStack
          .map(
            (n: VPL_Node) =>
              `{
            "id": ${n.ID},
            "name": "${n.Name}",
            "type": "${n.VPL_Node_Type()}",
            "inputs":  
            { 
                "data": [ 
                    ${n.Inputs.map(
                      (a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}",
                        "valueIsPath": ${a.Connection !== null},
                        "value": ${
                          a.Connection === null
                            ? a.HasField
                              ? a.Value.toString()
                              : "null"
                            : `
                        {
                            "node": ${a.Connection.ParentNode.ID},
                            "plug": "${a.Connection.Name}"
                        }`
                        }
                    }`
                    ).reduce(
                      (prev, curr, i) =>
                        `${prev}${",".repeat(
                          (i > 0) as unknown as number
                        )} ${curr}`,
                      ""
                    )}
                ],
                "actions": [ 
                    ${n.Actions.map(
                      (a) => `
                    {
                        "name": "${a.Name}",
                        "type": "Action",
                        "valueIsPath": ${a.Connection !== null},
                        "value": ${
                          a.Connection === null
                            ? "null"
                            : `
                        {
                            "node": ${a.Connection.ID},
                            "plug": "${a.Connection.Name}"
                        }`
                        }
                    }`
                    ).reduce(
                      (prev, curr, i) =>
                        `${prev}${",".repeat(
                          (i > 0) as unknown as number
                        )} ${curr}`,
                      ""
                    )}
                ]
            },
            "outputs":  
            { 
                "data": [ 
                    ${n.Outputs.map(
                      (a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}"
                    }`
                    ).reduce(
                      (prev, curr, i) =>
                        `${prev}${",".repeat(
                          (i > 0) as unknown as number
                        )} ${curr}`,
                      ""
                    )}
                ]
            }
        }`
          )
          .reduce(
            (prev, curr, i) =>
              `${prev}${",".repeat((i > 0) as unknown as number)} ${curr}`,
            ""
          )}
    ]
}`;
  }

  jsonTranspileAll(): string {
    let nodes: VPL_Node[] = [...this.currentGraph.nodes];

    //TODO: loop detection
    return `
{ 
    "nodes": [ 
        ${nodes
          .map(
            (n: VPL_Node) =>
              `{
            "x-pos": ${n.getPosition().x},
            "y-pos": ${n.getPosition().y},
            "id": ${n.ID},
            "name": "${n.Name}",
            "type": "${n.VPL_Node_Type()}",
            "inputs":  
            { 
                "data": [ 
                    ${n.Inputs.map(
                      (a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}",
                        "valueIsPath": ${a.Connection !== null},
                        "value": ${
                          a.Connection === null
                            ? a.HasField
                              ? a.Value.toString()
                              : "null"
                            : `
                        {
                            "node": ${a.Connection.ParentNode.ID},
                            "plug": "${a.Connection.Name}"
                        }`
                        }
                    }`
                    ).reduce(
                      (prev, curr, i) =>
                        `${prev}${",".repeat(
                          (i > 0) as unknown as number
                        )} ${curr}`,
                      ""
                    )}
                ],
                "actions": [ 
                    ${n.Actions.map(
                      (a) => `
                    {
                        "name": "${a.Name}",
                        "type": "Action",
                        "valueIsPath": ${a.Connection !== null},
                        "value": ${
                          a.Connection === null
                            ? "null"
                            : `
                        {
                            "node": ${a.Connection.ID},
                            "plug": "${a.Connection.Name}"
                        }`
                        }
                    }`
                    ).reduce(
                      (prev, curr, i) =>
                        `${prev}${",".repeat(
                          (i > 0) as unknown as number
                        )} ${curr}`,
                      ""
                    )}
                ]
            },
            "outputs":  
            { 
                "data": [ 
                    ${n.Outputs.map(
                      (a) => `
                    {
                        "name": "${a.Name}",
                        "type": "${GraphType[a.Type]}"
                    }`
                    ).reduce(
                      (prev, curr, i) =>
                        `${prev}${",".repeat(
                          (i > 0) as unknown as number
                        )} ${curr}`,
                      ""
                    )}
                ]
            }
        }`
          )
          .reduce(
            (prev, curr, i) =>
              `${prev}${",".repeat((i > 0) as unknown as number)} ${curr}`,
            ""
          )}
    ]
}`;
  }
}

//This being placed here is super cringe
function beginConnection(e: MouseEvent, fromPlug: VPL_Plug) {
  e.preventDefault();
  let rect = getBoundingClientRectPage(fromPlug);
  let curveSVG = makeSVGElement("path", {
    fill: "none",
    stroke: window.getComputedStyle(fromPlug).backgroundColor,
    "stroke-width": 4,
  });
  this.svgContainer.appendChild(curveSVG); //This is basically the only reason we ned this placed here, very bad Madge, but no time to fix now. No clue why it worked before, probably some lucky JS magic

  let from = new point(rect.x + rect.width / 2, rect.y + rect.height / 2);
  let to = new point(e.pageX, e.pageY);
  let center = point.add(from, to).multiply(1 / 2);
  let fromControl = new point(center.x, from.y);
  let toControl = new point(center.x, to.y);

  if (fromPlug instanceof OutPlug) {
    let curve = new svgCurve(curveSVG, from, to);
    let dragConnection = (e: MouseEvent) => {
      to = new point(e.pageX, e.pageY);
      center = point.add(from, to).multiply(1 / 2);

      fromControl = new point(center.x, from.y);
      toControl = new point(center.x, to.y);

      //Kinda cringe we end up recalcing thrice, I could remove the recalc from the setter and expose it, but that would mean the user would have to call it manually
      //A potentially good solution could be to have a setter that takes a variable amount of parameters, coudl be an object, where the unchanging points are just left undefined
      //Todo: low prio, maybe do that?
      curve.setEnd(to);
      curve.setStartControl(fromControl);
      curve.setEndControl(toControl);
    };

    let stopConnection = (e: MouseEvent) => {
      document.removeEventListener("mousemove", dragConnection);
      document.removeEventListener("mouseup", stopConnection);

      let targetPlug = e.target as HTMLElement;
      while (targetPlug && !(targetPlug instanceof VPL_Plug)) {
        //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
        targetPlug = targetPlug.parentNode as HTMLElement;
      }

      if (
        !targetPlug ||
        !(targetPlug instanceof InPlug) ||
        targetPlug.Type != fromPlug.Type
      ) {
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
  } else if (fromPlug instanceof InPlug) {
    let curve = new svgCurve(curveSVG, to, from);
    let dragConnection = (e: MouseEvent) => {
      to = new point(e.pageX, e.pageY);
      center = point.add(from, to).multiply(1 / 2);

      fromControl = new point(center.x, from.y);
      toControl = new point(center.x, to.y);

      curve.setStart(to);
      curve.setStartControl(toControl);
      curve.setEndControl(fromControl);
    };

    let stopConnection = (e: MouseEvent) => {
      document.removeEventListener("mousemove", dragConnection);
      document.removeEventListener("mouseup", stopConnection);

      let targetPlug = e.target as HTMLElement;
      while (targetPlug && !(targetPlug instanceof VPL_Plug)) {
        //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
        targetPlug = targetPlug.parentNode as HTMLElement;
      }

      if (
        !targetPlug ||
        !(targetPlug instanceof OutPlug) ||
        targetPlug.Type != fromPlug.Type
      ) {
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
  } else if (fromPlug instanceof ActionPlug) {
    let curve = new svgCurve(curveSVG, from, to);
    let dragConnection = (e: MouseEvent) => {
      to = new point(e.pageX, e.pageY);
      center = point.add(from, to).multiply(1 / 2);

      fromControl = new point(center.x, from.y);
      toControl = new point(center.x, to.y);

      curve.setEnd(to);
      curve.setStartControl(fromControl);
      curve.setEndControl(toControl);
    };

    let stopConnection = (e: MouseEvent) => {
      document.removeEventListener("mousemove", dragConnection);
      document.removeEventListener("mouseup", stopConnection);

      let target = e.target as HTMLElement;
      while (target != undefined && !(target instanceof VPL_Node)) {
        //Move up the parent hierachy, useless for the plugs, as they are (currently at least) leaf nodes, but could be useful if we want to select nodeDiv
        target = target.parentNode as HTMLElement;
      }

      if (!target || !(target instanceof ActionNode)) {
        //If it's not a node
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
  } else {
    throw new Error("Started connection on unknown plug type");
  }

  function addDots(curve: svgCurve) {
    let dots: {
      setter: (p: point) => void;
      getter: () => point;
      element: SVGElement;
    }[] = [
      {
        setter: curve.setStart.bind(curve),
        getter: curve.getStart.bind(curve),
        element: makeSVGElement("circle", {
          fill: "yellow",
          r: 5,
          "pointer-events": "all",
        }),
      },
      {
        setter: curve.setStartControl.bind(curve),
        getter: curve.getC1.bind(curve),
        element: makeSVGElement("circle", {
          fill: "#50FA7B",
          r: 5,
          "pointer-events": "all",
        }),
      },
      {
        setter: curve.setEndControl.bind(curve),
        getter: curve.getC2.bind(curve),
        element: makeSVGElement("circle", {
          fill: "#BD93F9",
          r: 5,
          "pointer-events": "all",
        }),
      },
      {
        setter: curve.setEnd.bind(curve),
        getter: curve.getEnd.bind(curve),
        element: makeSVGElement("circle", {
          fill: "blue",
          r: 5,
          "pointer-events": "all",
        }),
      },
    ];
    curve.addEvent("updateshit", (curve) => {
      dots.forEach((dot) => {
        dot.element.setAttribute("cx", dot.getter().x.toString());
        dot.element.setAttribute("cy", dot.getter().y.toString());
      });
    });

    let handleDotWrapper = function (dot: {
      setter: (p: point) => void;
      getter: () => point;
      element: SVGElement;
    }) {
      dot.element.setAttribute("cx", dot.getter().x.toString());
      dot.element.setAttribute("cy", dot.getter().y.toString());

      let handleDot = function (_: MouseEvent) {
        let dragDot = function (e: MouseEvent) {
          dot.setter(new point(e.pageX, e.pageY));
          dot.element.setAttribute("cx", dot.getter().x.toString());
          dot.element.setAttribute("cy", dot.getter().y.toString());
        };

        let releaseDot = function (_: MouseEvent) {
          document.removeEventListener("mousemove", dragDot);
          document.removeEventListener("mouseup", releaseDot);
        };

        document.addEventListener("mousemove", dragDot);
        document.addEventListener("mouseup", releaseDot);
      };

      dot.element.addEventListener("mousedown", handleDot);
    };

    dots.forEach((dot) => {
      handleDotWrapper(dot);
      this.svgContainer.appendChild(dot.element);
    });
  }
}
