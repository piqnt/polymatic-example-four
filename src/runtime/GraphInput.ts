// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { Config, Drag, findNearestVertex, type MainContext, type Point } from "../model";

/**
 * Drag from one vertex to another to connect them; emits "user-connect".
 *
 * Claims the pointer while dragging, so GraphScale doesn't also rotate and zoom. Must be used
 * before GraphScale for that.
 */
export class GraphInput extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.stopDrag);
    this.on("game-reset", this.stopDrag);
    this.on("game-continue", this.stopDrag);

    this.on("graph-pointer-down", this.handlePointerDown);
    this.on("graph-pointer-move", this.handlePointerMove);
    this.on("graph-pointer-up", this.handlePointerUp);
    this.on("graph-pointer-cancel", this.stopDrag);
  }

  handleActivate = () => {
    if (!this.context.drag) {
      this.context.drag = new Drag();
    }
    this.stopDrag();
  };

  stopDrag = () => {
    this.context.drag.clear();
    clearTimeout(this.setDragEndTimeout);
    this.setDragEndTimeout = null;
  };

  setDragEndTimeout: any;

  // debounced
  setDragEnd = (point: Point, instant = false) => {
    clearTimeout(this.setDragEndTimeout);
    this.setDragEndTimeout = null;
    if (instant) {
      const vertex = findNearestVertex(this.context, point, Config.vertexSnap);
      this.context.drag.setEnd(vertex);
    } else {
      this.setDragEndTimeout = setTimeout(() => this.setDragEnd(point, true), 10);
    }
  };

  handlePointerDown = (point: Point) => {
    // board is still animating the previous turn, ignore new connections until it settles
    if (this.context.board?.busy()) return;

    const vertex = findNearestVertex(this.context, point, Config.vertexSnap);
    if (vertex) {
      this.context.drag.setStart(vertex);
      // claim the pointer
      return true;
    }
  };

  handlePointerMove = (point: Point) => {
    if (this.context.drag.start) {
      this.context.drag.setEndPoint(point);
      this.setDragEnd(point);
      return true;
    }
  };

  handlePointerUp = (point: Point) => {
    const start = this.context.drag.start;
    this.stopDrag();
    if (!point || !start) return;
    const end = findNearestVertex(this.context, point, Config.vertexSnap);
    if (!end) return;
    this.emit("user-connect", { source: start, target: end });
  };
}
