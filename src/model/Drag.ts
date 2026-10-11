// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { uniqueId } from "./Util";
import { Point } from "./Graph";

export class Drag {
  key = uniqueId("drag");
  tag = "drag";

  start: Point | null;
  end: Point | null;
  endPoint: Point | null;

  setStart(point: Point) {
    this.start = point;
  }

  setEnd(point: Point) {
    if (same(this.start, point)) return;
    this.end = point;
  }

  setEndPoint(point: Point) {
    if (same(this.start, point)) return;
    this.endPoint = point;
  }

  clear() {
    this.start = null;
    this.end = null;
  }
}

const same = (a: Point, b: Point) => {
  return a && b && a.x == b.x && a.y == b.y;
};
