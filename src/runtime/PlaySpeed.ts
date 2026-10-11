// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { randomColorMany } from "../model";
import { randomBWBase, randomGraphSpeed } from "../model";
import { createGraphSet, createGraphRow, Graph, type Vertex } from "../model";
import { randomNumber } from "../model";
import { type MainContext, type PlayRules } from "../model";
import { FrameUpdate, type FrameLoopEvent } from "./FrameLoop";

const TIME = 60000;

export class PlaySpeed extends Middleware<MainContext> implements PlayRules {
  constructor() {
    super();
    this.on(FrameUpdate, this.handleFrameLoop);
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
    return this.context.mission.time <= 0;
  }

  handleFrameLoop = (e: FrameLoopEvent) => {
    this.context.mission.time = Math.max(0, this.context.mission.time - e.dt);
    this.context.mission.timeover = this.context.mission.time <= 0;
    // todo: this.emit("game-over");
  };

  start() {
    this.context.mission.maxVertices = 64;
    this.context.mission.completed = false;
    this.context.mission.time = TIME;
    this.context.mission.max = this.context.mission.time;
  }

  afterTurn(drops: Vertex[]) {
    const hits = drops.length;
    if (this.context.connected == 0) {
      // first turn
    } else if (this.context.connected == 1) {
      // todo: start timer here
    } else if (hits) {
      const add = hits * hits * 100;
      this.context.mission.time = Math.min(this.context.mission.time + add, TIME);
    }

    // this.context.level = Math.ceil(((this.end - this.start) / TIME) * 3) || 1;
    this.context.level = 1;

    this.context.board.insertAll(this.randomVertices(this.context.level));
  }

  randomVertices(level: number) {
    if (this.context.vertices.length == 0) {
      const graph: Graph = { vertices: [], edges: [] };
      createGraphSet(graph, randomColorMany(4, 4));
      return graph;
    }

    const graph: Graph = { vertices: [], edges: [] };
    randomBWBase.test() && randomBWBase.random(level)?.(graph);
    randomGraphSpeed.test() && randomGraphSpeed.random(level)?.(graph);
    createGraphRow(graph, randomNumber(1, level));
    return graph;
  }
}
