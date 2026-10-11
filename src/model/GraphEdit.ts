// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { arrayDrop } from "./Util";
import {
  findEdge,
  hasVertex,
  initEdge,
  initHint,
  initVertex,
  type Edge,
  type Graph,
  type Hint,
  type Vertex,
} from "./Graph";

/** The graph being edited, with all of its lists */
type GraphData = Required<Graph>;

/**
 * Edit a graph, keeping vertices, edges and hints consistent. Each edit takes effect at once;
 * pacing and laying out the graph are up to the caller.
 */

export const insertVertex = (graph: GraphData, data: Vertex) => {
  if (data["removed"]) return null;
  const vertex = initVertex(data);
  graph.vertices.push(vertex);
  return vertex;
};

export const insertEdge = (graph: GraphData, data: Partial<Edge>) => {
  const edge = initEdge(data);

  if (edge.removed || edge.source.removed || edge.target.removed) return null;

  edge.source = initVertex(edge.source);
  edge.target = initVertex(edge.target);

  const sl = findEdge(edge.source, edge.target, edge);
  const tl = findEdge(edge.target, edge.source, edge);

  // already connected
  if (sl > 0 || tl > 0) return null;

  edge.source.edges.push(edge);
  edge.target.edges.push(edge);

  graph.edges.push(edge);
  return edge;
};

export const insertHint = (graph: GraphData, data: Partial<Hint>) => {
  const hint = initHint(data);
  if (hint.removed || hint.source.removed || hint.target.removed) {
    return null;
  }
  hint.duration = 2000;
  graph.hints.push(hint);
  return hint;
};

export const removeEdge = (graph: GraphData, edge: Edge) => {
  if (edge.removed) return false;
  edge.removed = true;
  arrayDrop(graph.edges, edge);
  arrayDrop(edge.source.edges, edge);
  arrayDrop(edge.target.edges, edge);
  return true;
};

export const removeHint = (graph: GraphData, hint: Hint) => {
  if (hint.removed) return false;
  hint.removed = true;
  arrayDrop(graph.hints, hint);
  return true;
};

/** Remove a vertex, with its edges and hints */
export const removeVertex = (graph: GraphData, vertex: Vertex) => {
  if (vertex.removed) return false;
  vertex.removed = true;
  arrayDrop(graph.vertices, vertex);
  graph.edges.filter((edge) => hasVertex(edge, vertex)).forEach((edge) => removeEdge(graph, edge));
  graph.hints.filter((hint) => hasVertex(hint, vertex)).forEach((hint) => removeHint(graph, hint));
  return true;
};

export const removeItem = (graph: GraphData, item: Vertex | Edge | Hint) => {
  if (item.tag === "vertex") {
    removeVertex(graph, item);
  } else if (item.tag === "edge") {
    removeEdge(graph, item);
  } else if (item.tag === "hint") {
    removeHint(graph, item);
  } else {
    console.error("Unknown item", item);
  }
};
