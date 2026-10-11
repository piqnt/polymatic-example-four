// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { MainContext } from "../model";
import { Point } from "../model";
import { wrapNumber } from "../model";

/** Zoom and rotate graph view */
export class GraphScale extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("graph-pointer-down", this.handleScalePointerDown);
    this.on("graph-pointer-move", this.handleScalePointerMove);
    this.on("graph-pointer-up", this.handleScalePointerUp);
    this.on("graph-pointer-cancel", this.handleScalePointerUp);
  }

  isPointerDown: boolean;
  clickRadius: number;
  clickAngle: number;

  handleScalePointerDown = (point: Point) => {
    this.isPointerDown = true;
  };

  handleScalePointerMove = (point: Point) => {
    if (!this.isPointerDown) return;
    const graph = this.context.graph;
    const x = point.x;
    const y = point.y;
    const radius = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);
    if (typeof this.clickRadius === "number") {
      const zoom = (radius / this.clickRadius + 1) / 2;
      graph.pin("scale", Math.max(0.5, Math.min(2, graph.pin("scaleX") * zoom)));
    }
    if (typeof this.clickAngle === "number") {
      let rotate = wrapNumber(this.clickAngle - angle, -Math.PI, Math.PI);
      rotate = rotate / -2;
      graph.pin("rotation", graph.pin("rotation") + rotate);
    }
    this.clickRadius = radius;
    this.clickAngle = angle;
  };

  handleScalePointerUp = (point: Point) => {
    this.clickRadius = null;
    this.clickAngle = null;
    this.isPointerDown = false;
  };
}
