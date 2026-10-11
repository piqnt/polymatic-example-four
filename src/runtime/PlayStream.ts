// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { Color, randomColorMany } from "../model";
import { randomBWBase, randomGraphBase } from "../model";
import { createGraphSet, createGraphRow, Graph, Vertex } from "../model";
import { randomNumber } from "../model";
import { type MainContext, type PlayRules } from "../model";

export class PlayStream extends Middleware<MainContext> implements PlayRules {
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

  isGameover() {
    return this.context.vertices.length > this.context.mission.maxVertices;
  }

  start() {
    this.context.mission.maxVertices = Math.min(64, 16 * this.context.level);
    this.context.mission.completed = false;
    this.context.mission.score = Level_stream.required(this.context.level);
    this.context.mission.max = this.context.mission.score;

    this.context.board.insertAll(this.randomVertices(this.context.level));
  }

  afterTurn(drops: Vertex[]) {
    this.context.mission.score -= drops.length;
    this.context.mission.completed = this.context.mission.score <= 0;
    if (this.context.mission.completed) {
      this.context.level++;
      this.emit("game-level-up");
    }
    this.context.board.insertAll(this.randomVertices(this.context.level));
  }

  randomVertices(level: number) {
    if (this.context.vertices.length == 0) {
      const graph: Graph = { vertices: [], edges: [] };
      createGraphSet(graph, randomColorMany(4, this.context.connected ? 1 : 4));
      return graph;
    }

    const graph: Graph = { vertices: [], edges: [] };
    randomBWBase.test() && randomBWBase.random(level)?.(graph);
    randomGraphBase.test() && randomGraphBase.random(level)?.(graph);
    // graph.complete(Color.random(3).concat([Color.rock]));
    createGraphRow(graph, randomNumber(1, level));
    return graph;
  }
}

const Level_stream = {
  required: (level) => {
    return --level == 0 ? 100 : 500 * level * ++level;
  },
};
