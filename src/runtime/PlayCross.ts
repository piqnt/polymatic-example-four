// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { Color } from "../model";
import { createGraphOne, createGraphRow, Graph } from "../model";
import { type MainContext, type PlayRules } from "../model";

export class PlayCross extends Middleware<MainContext> implements PlayRules {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
  }

  handleActivate = () => {
    this.context.rules = this;
    // a mode starting continues its saved game, or starts a new one
    this.emit("game-continue");
  };

  handleDeactivate = () => {
    if (this.context.rules === this) {
      this.context.rules = null;
    }
  };

  start() {
    this.fillUp();
  }

  afterTurn() {
    if (this.context.vertices.length == 0) {
      this.fillUp();
    }
  }

  fillUp() {
    const graph: Graph = { vertices: [], edges: [] };
    createGraphOne(graph, { color: Color.wildcard, life: -1 });
    createGraphOne(graph, Color.bomb);
    const n = Math.min(Math.pow(this.context.level + 2, 2) / 4, 94);
    for (let i = 0; i < n; i++) {
      createGraphRow(graph, 4, 0.5);
    }
    this.context.board.insertAll(graph);
  }
}
