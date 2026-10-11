// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { findHintTo, type Vertex } from "../model";
import { Color } from "../model";
import { Matched } from "../model";
import { deserializeGraph, type MainContext, type PlayRules } from "../model";

export class PlayLearn extends Middleware<MainContext> implements PlayRules {
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
    this.context.mission.completed = false;
    this.fillUp();
  }

  /** Only the hinted connection */
  canLink(source: Vertex, target: Vertex) {
    return findHintTo(this.context, source, target);
  }

  evolvesVertices() {
    return false;
  }

  /** Highlight each match for a moment before it is removed */
  async beforeRemove(matched: Matched[]) {
    const board = this.context.board;
    // Four.zoom(1.1);
    for (const match of matched) {
      await board.wait(10);
      this.context.vertices.forEach((each) => {
        each.muted = true;
      });
      this.context.edges.forEach((each) => {
        each.muted = true;
      });
      // Four.zoom(1/1.1);
      match.vertices.forEach((d) => {
        d.muted = false;
      });
      match.edges.forEach((d) => {
        d.muted = false;
      });
      await board.wait(900);
    }
  }

  afterTurn(drops: Vertex[]) {
    if (this.context.vertices.length == 0) {
      drops && this.context.level++;
      this.fillUp();
    }
  }

  fillUp() {
    const level = this.context.level - 1;
    if (level >= tutorialLevels.length) {
      // back to level 1 for next time
      this.context.level = 1;

      // start default mode
      // todo: setTimeout(() => this.reset(), 1);
    } else {
      const graph = deserializeGraph(tutorialLevels[level]);
      console.log("learn level", tutorialLevels[level], graph);
      this.context.board.insertAll(graph);
    }
  }
}

const tutorialLevels = [
  {
    vertices: [
      { key: "basic-1-0", a: 1 / 8, color: Color.red },
      { key: "basic-1-1", a: 3 / 8, color: Color.green },
      { key: "basic-1-2", a: 5 / 8, color: Color.blue },
      { key: "basic-1-3", a: 7 / 8, color: Color.yellow },
    ],
    hints: [
      { source: "basic-1-0", target: "basic-1-1" },
      { source: "basic-1-1", target: "basic-1-2" },
      { source: "basic-1-2", target: "basic-1-3" },
    ],
  },
  {
    vertices: [
      { key: "basic-2-0", a: 1 / 8, color: Color.red },
      { key: "basic-2-1", a: 3 / 8, color: Color.green },
      { key: "basic-2-2", a: 5 / 8, color: Color.blue },
      { key: "basic-2-3", a: 7 / 8, color: Color.yellow },
    ],
    edges: [
      { source: "basic-2-0", target: "basic-2-1" },
      { source: "basic-2-2", target: "basic-2-3" },
    ],
    hints: [{ source: "basic-2-1", target: "basic-2-2" }],
  },
  {
    vertices: [
      { key: "basic-3-0", a: 9 / 10, color: Color.red },
      { key: "basic-3-1", a: 3 / 10, color: Color.green },
      { key: "basic-3-2", a: 5 / 10, color: Color.blue },
      { key: "basic-3-3", a: 7 / 10, color: Color.yellow },
      { key: "basic-3-4", a: 1 / 10, color: Color.yellow },
    ],
    edges: [
      { source: "basic-3-2", target: "basic-3-1" },
      { source: "basic-3-3", target: "basic-3-0" },
      { source: "basic-3-4", target: "basic-3-0" },
    ],
    hints: [{ source: "basic-3-0", target: "basic-3-1" }],
  },
  {
    vertices: [
      { key: "basic-4-0", a: 7 / 12, color: Color.red },
      { key: "basic-4-1", a: 9 / 12, color: Color.blue },
      { key: "basic-4-2", a: 11 / 12, color: Color.green },
      { key: "basic-4-3", a: 1 / 12, color: Color.green },
      { key: "basic-4-4", a: 3 / 12, color: Color.blue },
      { key: "basic-4-5", a: 5 / 12, color: Color.yellow },
    ],
    edges: [
      { source: "basic-4-0", target: "basic-4-1" },
      { source: "basic-4-1", target: "basic-4-2" },
      { source: "basic-4-3", target: "basic-4-4" },
      { source: "basic-4-4", target: "basic-4-5" },
    ],
    hints: [{ source: "basic-4-0", target: "basic-4-5" }],
  },
  {
    vertices: [
      { key: "basic-5-0", a: 1 / 16, color: Color.red },
      { key: "basic-5-1", a: 5 / 16, color: Color.red },
      { key: "basic-5-2", a: 9 / 16, color: Color.red },
      { key: "basic-5-3", a: 13 / 16, color: Color.red },
      { key: "basic-5-4", a: 3 / 16, color: Color.blue },
      { key: "basic-5-5", a: 11 / 16, color: Color.blue },
      { key: "basic-5-6", a: 7 / 16, color: Color.green },
      { key: "basic-5-7", a: 15 / 1, color: Color.yellow },
    ],
    edges: [
      { source: "basic-5-4", target: "basic-5-0" },
      { source: "basic-5-4", target: "basic-5-1" },
      { source: "basic-5-5", target: "basic-5-2" },
      { source: "basic-5-5", target: "basic-5-3" },
      { source: "basic-5-6", target: "basic-5-4" },
      { source: "basic-5-6", target: "basic-5-5" },
    ],
    hints: [{ source: "basic-5-7", target: "basic-5-6" }],
  },
  {
    vertices: [
      { key: "bomb-6-0", a: 2 / 8, color: Color.red },
      { key: "bomb-6-1", a: 3 / 8, color: Color.green },
      { key: "bomb-6-2", a: 4 / 8, color: Color.blue },
      { key: "bomb-6-3", a: 7 / 8, color: Color.yellow },
    ],
    edges: [
      { source: "bomb-6-0", target: "bomb-6-1" },
      { source: "bomb-6-1", target: "bomb-6-2" },
      { source: "bomb-6-2", target: "bomb-6-0" },
    ],
    hints: [{ source: "bomb-6-3", target: "bomb-6-0" }],
  },
  {
    vertices: [
      { key: "wildcard-1-0", a: 1 / 8, color: Color.red },
      { key: "wildcard-1-1", a: 3 / 8, color: Color.blue },
      { key: "wildcard-1-2", a: 5 / 8, color: Color.yellow },
      { key: "wildcard-1-3", a: 7 / 8, color: Color.wildcard },
    ],
    edges: [
      { source: "wildcard-1-0", target: "wildcard-1-1" },
      { source: "wildcard-1-1", target: "wildcard-1-2" },
    ],
    hints: [{ source: "wildcard-1-2", target: "wildcard-1-3" }],
  },
  {
    vertices: [
      { key: "wildcard-1-0", a: 1 / 8, color: Color.wildcard },
      { key: "wildcard-1-1", a: 3 / 8, color: Color.green },
      { key: "wildcard-1-2", a: 5 / 8, color: Color.blue },
      { key: "wildcard-1-3", a: 7 / 8, color: Color.wildcard },
    ],
    edges: [
      { source: "wildcard-1-0", target: "wildcard-1-1" },
      { source: "wildcard-1-1", target: "wildcard-1-2" },
    ],
    hints: [{ source: "wildcard-1-2", target: "wildcard-1-3" }],
  },
  {
    vertices: [
      { key: "wildcard-2-0", a: 1 / 8, color: Color.red },
      { key: "wildcard-2-1", a: 3 / 8, color: Color.wildcard },
      { key: "wildcard-2-2", a: 5 / 8, color: Color.wildcard },
      { key: "wildcard-2-3", a: 7 / 8, color: Color.wildcard },
    ],
    edges: [
      { source: "wildcard-2-0", target: "wildcard-2-1" },
      { source: "wildcard-2-1", target: "wildcard-2-2" },
    ],
    hints: [{ source: "wildcard-2-2", target: "wildcard-2-3" }],
  },
  {
    vertices: [
      { key: "bomb-1-0", color: Color.yellow },
      { key: "bomb-1-1", color: Color.bomb },
    ],
    hints: [{ source: "bomb-1-1", target: "bomb-1-0" }],
  },
  {
    vertices: [
      { key: "bomb-2-0", color: Color.blue },
      { key: "bomb-2-1", color: Color.red },
      { key: "bomb-2-2", color: Color.red },
      { key: "bomb-2-3", color: Color.red },
      { key: "bomb-2-4", color: Color.bomb },
    ],
    edges: [
      { source: "bomb-2-0", target: "bomb-2-3" },
      { source: "bomb-2-1", target: "bomb-2-3" },
      { source: "bomb-2-2", target: "bomb-2-3" },
    ],
    hints: [{ source: "bomb-2-4", target: "bomb-2-3" }],
  },
  {
    vertices: [
      { key: "bomb-3-0", a: 1 / 12, color: Color.red },
      { key: "bomb-3-1", a: 3 / 12, color: Color.red },
      { key: "bomb-3-2", a: 5 / 12, color: Color.blue },
      { key: "bomb-3-3", a: 7 / 12, color: Color.blue },
      { key: "bomb-3-4", a: 9 / 12, color: Color.red },
      { key: "bomb-3-5", a: 11 / 12, color: Color.bomb },
    ],
    edges: [
      { source: "bomb-3-0", target: "bomb-3-1" },
      { source: "bomb-3-1", target: "bomb-3-2" },
      { source: "bomb-3-2", target: "bomb-3-3" },
      { source: "bomb-3-3", target: "bomb-3-4" },
    ],
    hints: [{ source: "bomb-3-5", target: "bomb-3-2" }],
  },
];
