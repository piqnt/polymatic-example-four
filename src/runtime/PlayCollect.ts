// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { Color, randomColorMany } from "../model";
import { createGraphSet, createGraphRow, Graph, type Vertex } from "../model";
import { randomBWBase, randomGraphBase } from "../model";
import { randomNumber } from "../model";
import { type MainContext, type PlayRules } from "../model";

/** Implements "collect" gameplay */
export class PlayCollect extends Middleware<MainContext> implements PlayRules {
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
    this.startLevel();
    this.context.board.insertAll(this.randomVertices(this.context.level));
  }

  isGameover() {
    return this.context.vertices.length > this.context.mission.maxVertices;
  }

  /** Set the mission for the current level */
  startLevel() {
    this.context.mission.completed = false;
    this.context.mission.vertices = 0;
    Color.collectible.forEach((color) => {
      const req = Level_collect[color];
      if (!req) return;
      this.context.mission[color] = req[this.context.level - 1];
      this.context.mission.vertices += this.context.mission[color];
    });

    this.context.mission.max = this.context.mission.vertices;

    this.context.mission.maxVertices = Math.min(64, 16 * this.context.level);

    this.context.mission.loadover = false;
  }

  afterTurn(drops: Vertex[]) {
    this.context.mission.loadover = this.context.vertices.length > this.context.mission.maxVertices;

    drops?.forEach((vertex) => {
      this.context.stats[vertex.color] = (this.context.stats[vertex.color] || 0) + 1;
      if (typeof this.context.mission[vertex.color] === "number") {
        this.context.mission[vertex.color] = Math.max(0, this.context.mission[vertex.color] - 1);
      }
    });

    this.context.mission.completed = true;
    Color.collectible.forEach((color) => {
      if (this.context.mission[color] > 0) {
        this.context.mission.completed = false;
      }
    });

    if (this.context.mission.completed) {
      this.nextLevel();
    } else {
      this.context.board.insertAll(this.randomVertices(this.context.level));
    }
  }

  /** Clear the board, then fill it for the next level */
  async nextLevel() {
    this.context.level = (this.context.level % Level_collect.levels) + 1;
    this.emit("game-level-up");
    this.context.stats = {};
    const board = this.context.board;
    await board.removeAll([...this.context.edges, ...this.context.vertices, ...this.context.hints]);
    this.startLevel();
    await board.insertAll(this.randomVertices(this.context.level));
  }

  randomVertices(level: number) {
    if (this.context.vertices.length == 0) {
      const graph: Graph = { vertices: [], edges: [] };
      createGraphSet(graph, randomColorMany(4, 4));
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

const Level_collect = {
  levels: 6,
};

Level_collect[Color.bomb] = [1, 2, 4, 8, 16, 32];
Level_collect[Color.wildcard] = [1, 2, 4, 8, 16, 32];
Level_collect[Color.red] = [8, 16, 32, 64, 128, 256];
Level_collect[Color.green] = [8, 16, 32, 64, 128, 256];
Level_collect[Color.blue] = [8, 16, 32, 64, 128, 256];
Level_collect[Color.yellow] = [8, 16, 32, 64, 128, 256];
