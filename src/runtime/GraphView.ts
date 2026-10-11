// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Binder, Driver, Middleware } from "polymatic";

import { type Vertex, type Edge, type Hint, type Point } from "../model";
import { type Drag } from "../model";
import { MainContext } from "../model";
import { FrameUpdate } from "./FrameLoop";

/** Renders graph and handles pointer events */
export class GraphView extends Middleware<MainContext> {
  graph: Stage.Component;

  isPointerMoving: boolean;
  markersLayer: Stage.Component;
  edgesLayer: Stage.Component;
  verticesLayer: Stage.Component;

  inited = false;

  constructor() {
    super();
    this.on("activate", this.initComponents);
    this.on(FrameUpdate, this.handleFrameUpdate);
  }

  initComponents = () => {
    if (this.inited) return;
    this.inited = true;
    const screen = this.context.screen;

    this.graph = new Stage.Component();
    this.context.graph = this.graph;
    this.graph.appendTo(screen);
    this.graph.pin({ align: 0.5, handle: 0 });
    this.graph.on(Stage.POINTER_DOWN, this.handlePointerDown);
    this.graph.on(Stage.POINTER_MOVE, this.handlePointerMove);
    this.graph.on(Stage.POINTER_UP, this.handlePointerUp);
    this.graph.on(Stage.POINTER_CANCEL, this.handlePointerCancel);
    this.graph.attr("spy", true);

    this.markersLayer = Stage.component();
    this.markersLayer.appendTo(this.graph);
    this.edgesLayer = Stage.component();
    this.edgesLayer.appendTo(this.graph);
    this.verticesLayer = Stage.component();
    this.verticesLayer.appendTo(this.graph);
  };

  handlePointerDown = (point: Point) => {
    this.isPointerMoving = true;
    if (!point) return;
    this.emit("graph-pointer-down", point);
    return true;
  };

  handlePointerMove = (point: Point) => {
    if (!this.isPointerMoving) return;
    if (!point) return;
    this.emit("graph-pointer-move", point);
    return true;
  };

  handlePointerUp = (point: Point) => {
    this.isPointerMoving = false;
    if (!point) return;
    this.emit("graph-pointer-up", point);
    return true;
  };

  handlePointerCancel = () => {
    this.emit("graph-pointer-cancel");
    return true;
  };

  handleFrameUpdate = () => {
    if (!this.inited) return;
    this.binder.data([...this.context.edges, ...this.context.hints, ...this.context.vertices, this.context.drag]);
  };

  vertexDriver = Driver.create<Vertex, Stage.Sprite>({
    filter: (object) => object.tag == "vertex",
    enter: () => {
      const ui = Stage.sprite();
      ui.pin("handle", 0.5);
      ui.appendTo(this.verticesLayer);
      return ui;
    },
    exit: (vertex, ui) => {
      if (!ui) return;
      ui.tween(40).scale(1.2).alpha(0).remove();
    },
    update: (vertex: Vertex, ui: Stage.Sprite) => {
      if (!ui) return;
      let type = "vertex_" + String(vertex.color);
      if (vertex.muted) {
        type = "vertex_muted";
      }
      if (ui["texture_type"] != type) {
        ui["texture_type"] = type;
        ui.texture(type);
      }
      ui.pin("offsetX", vertex.x);
      ui.pin("offsetY", vertex.y);
    },
  });

  // hints are drawn as edges too, dashed by their duration
  edgeDriver = Driver.create<Edge | Hint, EdgeComponent>({
    filter: (object) => object.tag == "edge" || object.tag == "hint",
    enter: (d) => {
      const component = new EdgeComponent();
      component.appendTo(this.edgesLayer);
      return component;
    },
    exit: (edge, component) => {
      if (!component) return;
      component.remove();
    },
    update: (edge, component) => {
      if (!component) return;
      let type = "edge";
      if (edge.duration) {
        type = "edge_dashed";
      } else if (edge.muted) {
        type = "edge_muted";
      }
      if (component.type != type) {
        component.type = type;
        component.texture(type);
        component.duration = edge.duration;
        component.time = Date.now();
      }
      component.setPoints(edge.source, edge.target);
    },
  });

  dragInDriver = Driver.create<Drag, Stage.Sprite>({
    filter: (object) => object.tag == "drag",
    enter: (drag) => {
      const component = Stage.sprite("drag-in");
      component.pin("handle", 0.5);
      component.appendTo(this.markersLayer);
      component.hide();
      return component;
    },
    exit: (drag, component) => {
      if (!component) return;
      component.remove();
    },
    update: (drag, component) => {
      if (!component) return;
      if (drag.start) {
        component.show();
        component.pin("offsetX", drag.start.x);
        component.pin("offsetY", drag.start.y);
      } else {
        component.hide();
      }
    },
  });

  dragOutDriver = Driver.create<Drag, Stage.Sprite>({
    filter: (object) => object.tag == "drag",
    enter: (drag) => {
      const component = Stage.sprite("drag-out");
      component.pin("handle", 0.5);
      component.appendTo(this.markersLayer);
      component.hide();
      return component;
    },
    exit: (drag, component) => {
      if (!component) return;
      component.remove();
    },
    update: (drag, component) => {
      if (!component) return;
      if (drag.end) {
        component.show();
        component.pin("offsetX", drag.end.x);
        component.pin("offsetY", drag.end.y);
      } else {
        component.hide();
      }
    },
  });

  dragLineDriver = Driver.create<Drag, EdgeComponent>({
    filter: (object) => object.tag == "drag",
    enter: () => {
      const component = new EdgeComponent();
      component.texture("edge_dashed");
      component.appendTo(this.markersLayer);
      component.hide();
      return component;
    },
    exit: (d, component) => {
      if (!component) return;
      component.remove();
    },
    update: (d, component) => {
      if (!component) return;
      if (d.start && d.endPoint) {
        component.setPoints(d.start, d.endPoint);
        component.show();
      } else {
        component.hide();
      }
    },
  });

  binder = Binder.create<Vertex | Edge | Hint | Drag>({
    key: (d) => d.key,
    drivers: [this.vertexDriver, this.edgeDriver, this.dragInDriver, this.dragOutDriver, this.dragLineDriver],
  });
}

// function onMouseDouble(point) {
//   DEBUG && console.log("mouse-double: " + point);
//   if (this.terminal.four.mode.designing) {
//     insertVertex(point, true);
//     store_saveGame(2000);
//   }
// }

class EdgeComponent extends Stage.Sprite {
  x = 0;
  y = 0;
  dx = 0;
  dy = 0;

  duration: number;
  time: number;
  length: number;
  type: string;

  constructor() {
    super();
    this.tile();
    this.pin({ pivot: 0.5, handle: 0.5 });
    this.tick(this.handleTick);
  }

  handleTick = () => {
    if (this.duration && this.time) {
      this.draw();
    }
  };

  setPoints(a: Stage.Vec2Value, b: Stage.Vec2Value) {
    this.x = a.x;
    this.y = a.y;
    this.dx = b.x - a.x;
    this.dy = b.y - a.y;

    this.length = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
    this.pin("rotation", Math.atan2(this.dy, this.dx));

    if (!this.duration) {
      this.draw(1);
    } else {
      this.draw();
    }
    return this;
  }

  draw(p?: number) {
    if (typeof p === "undefined") {
      p = ((Date.now() - this.time) % this.duration) / this.duration;
    }
    this.width(this.length * p + 1);
    this.pin("offsetX", this.x + (this.dx * p) / 2);
    this.pin("offsetY", this.y + (this.dy * p) / 2);
  }
}
