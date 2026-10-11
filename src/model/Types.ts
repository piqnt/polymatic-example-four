// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Vertex, Edge } from "./Graph";

export interface Mission {
  red?: number;
  blue?: number;
  green?: number;
  yellow?: number;
  wildcard?: number;
  bomb?: number;

  time?: number;

  score?: number;

  vertices?: number;
  edges?: number;

  completed?: boolean;

  loadover?: boolean;
  timeover?: boolean;

  maxVertices?: number;

  max?: number;
}

export interface Matched {
  vertices: Vertex[];
  edges: Edge[];
}
