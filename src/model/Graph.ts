// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { arrayNext, isNumeric, uniqueId } from "./Util";
import { Config } from "./Config";
import { Color, colorLife, ColorType, randomColorOne } from "./Color";

const DEBUG = false;

export interface Point {
  x: number;
  y: number;
}

export interface Graph {
  vertices: Vertex[];
  edges: Edge[];
  hints?: Hint[];
}

export interface Vertex {
  key: string;
  tag: "vertex";

  muted: boolean;
  removed: boolean;

  color?: ColorType;
  life?: number;
  joker?: boolean;

  x: number;
  y: number;

  a?: number;
  r?: number;

  edges?: Edge[];
}

/** Fields shared by edges and hints: a line between two vertices */
export interface Link {
  key: string;

  source: Vertex;
  target: Vertex;

  muted: boolean;
  removed: boolean;

  duration: number;
}

export interface Edge extends Link {
  tag: "edge";
}

export interface Hint extends Link {
  tag: "hint";
}

export const createGraphOne = (g: Graph, d: ColorType | Partial<Vertex>) => {
  DEBUG && console.log("graph-one: " + d);
  if (typeof d === "object") {
    g.vertices.push(initVertex(d));
  } else if (typeof d === "string") {
    g.vertices.push(initVertex({ color: d }));
  }
};

export const createGraphSet = (g: Graph, data: (ColorType | Partial<Vertex>)[]) => {
  DEBUG && console.log("graph-array: " + data);
  const vertices = [];
  for (const d of data) {
    if (typeof d === "object") {
      vertices.push(initVertex(d));
    } else if (typeof d === "string") {
      vertices.push(initVertex({ color: d }));
    }
  }
  for (const vertex of vertices) {
    g.vertices.push(vertex);
  }
};

export const createGraphTree = (g: Graph, n: number, colors: ColorType[]) => {
  DEBUG && console.log("graph-tree: " + n + "/" + colors);
  const queue = [];
  for (let c = 0; c < colors.length; c++) {
    for (let i = 0; i < Math.pow(n, c); i++) {
      const vertex = initVertex({ color: colors[c] });
      g.vertices.push(vertex);
      if (queue.length > 0) {
        g.edges.push(initEdge({ source: queue.shift(), target: vertex }));
      }
      for (let j = 0; j < n; j++) {
        queue.push(vertex);
      }
    }
  }
};

export const createGraphStar = (g: Graph, data: (ColorType | Partial<Vertex>)[]) => {
  DEBUG && console.log("graph-star: " + data);
  const vertices = [];
  for (const d of data) {
    if (typeof d === "object") {
      vertices.push(initVertex(d));
    } else if (typeof d === "string") {
      vertices.push(initVertex({ color: d }));
    }
  }

  let first = null;
  vertices.forEach((vertex) => {
    g.vertices.push(vertex);
    if (first) {
      g.edges.push(initEdge({ source: first, target: vertex }));
    } else {
      first = vertex;
    }
  });
};

export const createGraphRow = (g: Graph, length: number, spare?: number) => {
  DEBUG && console.log("graph-row: " + length);
  const vertices = [];
  for (let i = 0; i < length; i++) {
    vertices.push(initVertex({}));
  }
  let last = null;
  vertices.forEach((vertex) => {
    g.vertices.push(vertex);
    if (last) {
      if (!spare || spare < Math.random()) {
        g.edges.push(initEdge({ source: last, target: vertex }));
      }
    }
    last = vertex;
  });
};

export const createGraphComplete = (g: Graph, colors: ColorType[], spare?: number) => {
  DEBUG && console.log("graph-complete: " + colors);
  const vertices = [];
  for (const color of colors) {
    vertices.push(initVertex({ color }));
  }
  const added = [];
  vertices.forEach((vertex) => {
    g.vertices.push(vertex);
    added.forEach((old) => {
      if (!spare || spare < Math.random()) {
        g.edges.push(initEdge({ source: old, target: vertex }));
      }
    });
    added.push(vertex);
  });
};

export const initVertex = (vertex: Partial<Vertex>): Vertex => {
  vertex.key = vertex.key ?? uniqueId("vertex");
  vertex.color = vertex.color ?? randomColorOne();
  vertex.life = vertex.life ?? colorLife(vertex.color);

  vertex.edges = vertex.edges ?? [];

  if (isNumeric(vertex.x) && isNumeric(vertex.y)) {
  } else if (isNumeric(vertex.a) && isNumeric(vertex.r)) {
    const a = vertex.a;
    const r = vertex.r;
    vertex.x = Math.sin(a * 2 * Math.PI) * r;
    vertex.y = Math.cos(a * 2 * Math.PI) * r;
  } else {
    const a = Math.random();
    const r = Math.random() * Config.distRange + Config.distOffset;
    vertex.x = Math.sin(a * 2 * Math.PI) * r;
    vertex.y = Math.cos(a * 2 * Math.PI) * r;
  }
  vertex.tag = "vertex";
  return vertex as Vertex;
};

export const initEdge = (edge: Partial<Edge>): Edge => {
  edge.key = edge.key ?? uniqueId("edge");
  edge.source = edge.source ?? edge["s"];
  edge.target = edge.target ?? edge["t"];
  edge.tag = "edge";
  return edge as Edge;
};

export const initHint = (hint: Partial<Hint>): Hint => {
  hint.key = hint.key ?? uniqueId("hint");
  hint.source = hint.source ?? hint["s"];
  hint.target = hint.target ?? hint["t"];
  hint.tag = "hint";
  return hint as Hint;
};

export const findEdge = (left: Vertex, right: Vertex, edge: Edge) => {
  let any = false;
  let exact = false;
  for (let i = 0; i < left.edges.length; i++) {
    const l = left.edges[i];
    if (edge && l === edge) {
      exact = true;
    } else if (right && hasVertex(l, right)) {
      any = true;
    }
  }
  return exact ? 2 : any ? 1 : 0;
};

export const findHintTo = (g: Graph, vertex: Vertex, other: Vertex) => {
  return g.hints?.some((hint) => hasVertex(hint, vertex) && hasVertex(hint, other));
};

export const hasVertex = (edge: Link, vertex: Vertex) => {
  return edge.source === vertex || edge.target === vertex;
};

export const otherSide = (edge: Link, vertex: Vertex) => {
  return vertex === edge.target ? edge.source : edge.target;
};

export const findNearestVertex = (context: Graph, point: Point, radius: number): Vertex | null => {
  if (!point) return null;
  const x = point.x;
  const xmin = x - radius;
  const xmax = x + radius;
  const y = point.y;
  const ymin = y - radius;
  const ymax = y + radius;

  let nearest: Vertex | null = null;
  let min = radius * radius;

  for (let i = 0; i < context.vertices.length; i++) {
    const vertex = context.vertices[i];
    const isHit = xmin <= vertex.x && vertex.x <= xmax && ymin <= vertex.y && vertex.y <= ymax;
    if (isHit) {
      const dx = vertex.x - x;
      const dy = vertex.y - y;
      const d = dx * dx + dy * dy;
      if (d < min) {
        min = d;
        nearest = vertex;
      }
    }
  }

  return nearest;
};
