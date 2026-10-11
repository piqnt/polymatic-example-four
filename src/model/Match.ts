// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Color } from "./Color";
import { otherSide, type Vertex, type Edge } from "./Graph";
import { type Matched } from "./Types";

/** The four rules for connecting two vertices: at most 4 edges each, and rocks only to bombs */
export const isLinkable = (source: Vertex, target: Vertex) => {
  if (source.edges && source.edges.length >= 4) return false;
  if (target.edges && target.edges.length >= 4) return false;
  if (target.color == Color.rock && source.color != Color.bomb) return false;
  if (source.color == Color.rock && target.color != Color.bomb) return false;
  return true;
};

/** Evaluate four colors in the given path */
export const testColors = (path: Vertex[]) => {
  if (!Array.isArray(path)) return false;
  const found: Record<number, number> = {};
  found[Color.red] = 0;
  found[Color.green] = 0;
  found[Color.blue] = 0;
  found[Color.yellow] = 0;
  found[Color.wildcard] = 0;
  found[Color.bomb] = 0;
  path.forEach((vertex) => {
    if (vertex.color == Color.wildcard || vertex.color == Color.bomb) {
      found[vertex.color] += 1;
    } else {
      found[vertex.color] = 1;
    }
  });
  return (
    found[Color.red] +
      found[Color.green] +
      found[Color.blue] +
      found[Color.yellow] +
      found[Color.wildcard] +
      found[Color.bomb] * 4 >=
    4
  );
};

/** Matching paths of up to four vertices through a newly connected edge */
export const findMatches = (edge: Edge): Matched[] => {
  const matched: Matched[] = [];
  testEdge(matched, edge);
  return matched;
};

/** The vertices to remove for the given matches, each once */
export const matchVertices = (matched: Matched[]) => {
  const vertices: Vertex[] = [];
  matched.forEach((match) => {
    match.vertices.forEach((vertex) => {
      if (!vertex.removed) {
        vertices.push(vertex);
      }
    });
  });
  return vertices;
};

const testVertices = (matched: Matched[], vertices: Vertex[], edges: Edge[]) => {
  if (testColors(vertices)) {
    matched.push({ vertices, edges: edges });
  }
};

const testEdge = (matched: Matched[], edge: Edge, prev?: Edge) => {
  const s = edge.source;
  const t = edge.target;
  if (s.color === Color.rock || t.color === Color.rock) return;

  // s-t
  testVertices(matched, [s, t], [edge]);
  s.edges.forEach((sl) => {
    if (sl === edge) return;
    const ss = otherSide(sl, s);
    t.edges.forEach((tl) => {
      if (tl === edge) return;
      const tt = otherSide(tl, t);
      if (tt === ss) return;
      // ss-s-t-tt
      testVertices(matched, [ss, s, t, tt], [sl, edge, tl]);
    });
  });
  if (!prev) {
    s.edges.forEach((sl) => {
      if (sl === edge) return;
      const ss = otherSide(sl, s);
      // ss-s-t
      testVertices(matched, [ss, s, t], [sl, edge]);
      // sss-ss-s-t
      testEdge(matched, sl, edge);
    });
    t.edges.forEach((tl) => {
      if (tl === edge) return;
      const tt = otherSide(tl, t);
      // s-t-tt
      testVertices(matched, [s, t, tt], [edge, tl]);
      // s-t-tt-ttt
      testEdge(matched, tl, edge);
    });
  }
};
