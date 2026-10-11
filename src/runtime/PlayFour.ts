// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { Vertex, Edge, Hint, Graph, initEdge } from "../model";
import { insertEdge, insertHint, insertVertex, removeItem } from "../model";
import { Config } from "../model";
import { arrayNext } from "../model";
import { Color } from "../model";
import { MainContext } from "../model";
import { Matched, findMatches, isLinkable, matchVertices } from "../model";
import { Clock } from "../model";
import { type Board, type SavedGame, deserializeGraph, serializeGame } from "../model";
import { FrameUpdate, type FrameLoopEvent } from "./FrameLoop";
import { ForceLayout } from "./ForceLayout";

const DEBUG = false;

/**
 * Implements four match logic, and plays the game with the active play mode's rules. Makes and
 * paces every change to the graph, lays it out, and is the board play modes use.
 *
 * Stays activated across mode switches. A mode starting emits "game-continue", which continues its
 * saved game or starts a new one; "game-reset" starts a new one. The game is saved whenever the
 * board settles.
 */
export class FourBoard extends Middleware<MainContext> implements Board {
  /** paces the animated turn sequences; waits are dropped on reset, so those sequences stop */
  clock = new Clock();

  /** moves vertices while the game runs; their positions are kept on the vertices */
  layout: ForceLayout;

  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
    this.on("game-continue", this.handleContinue);
    this.on("game-reset", this.handleReset);
    this.on("user-connect", this.handleUserConnect);

    this.on(FrameUpdate, this.handleFrameUpdate);
  }

  /** the active mode's rules, null between modes */
  get rules() {
    return this.context.rules;
  }

  async insertAll(graph: Graph) {
    for (const vertex of graph.vertices ?? []) {
      await this.wait(150);
      insertVertex(this.context, vertex);
      this.layout.start();
      this.unsaved = true;
    }
    for (const edge of graph.edges ?? []) {
      await this.wait(50);
      insertEdge(this.context, edge);
      this.layout.start();
      this.unsaved = true;
    }
    for (const hint of graph.hints ?? []) {
      await this.wait(50);
      insertHint(this.context, hint);
      this.layout.start();
      this.unsaved = true;
    }
  }

  async removeAll(items: (Vertex | Edge | Hint)[]) {
    for (const item of items ?? []) {
      await this.wait(20);
      removeItem(this.context, item);
      this.layout.start();
      this.unsaved = true;
    }
  }

  wait(ms: number) {
    return this.clock.wait(ms);
  }

  busy() {
    return this.clock.busy();
  }

  handleActivate = () => {
    this.clock.clear();
    this.layout = new ForceLayout(this.context.vertices, this.context.edges);
    this.layout.setSize([0, 0]);
    this.layout.setEdgeDistance(45 * Config.scale);
    this.layout.setCharge(-180 * Config.scale * Config.scale);
    this.layout.setEdgeStrength(0.5);
    this.layout.setFriction(0.8);
    this.layout.setMinAlpha(0.01);
    this.context.board = this;
  };

  handleDeactivate = () => {
    this.clock.clear();
    this.layout.stop();
    if (this.context.board === this) {
      this.context.board = null;
    }
  };

  handleFrameUpdate = (e: FrameLoopEvent) => {
    this.clock.step(e.dt);
    this.layout.tick();
    // save between moves, never in the middle of one
    if (this.unsaved && !this.clock.busy()) {
      this.saveGame();
    }
  };

  /** the key of the mode being played, which its game is saved under */
  get modeKey() {
    return this.context.mode.value?.key;
  }

  /** a mode started: continue its saved game, or start a new one */
  handleContinue = () => {
    this.clock.clear();
    const saved = this.modeKey && this.context.store?.loadGame(this.modeKey);
    // an empty board, like a finished tutorial, has nothing to continue
    if (saved && saved.vertices.length) {
      this.restoreGame(saved);
    } else {
      this.startGame();
    }
  };

  /** the player asked for a new game */
  handleReset = () => {
    this.clock.clear();
    if (this.modeKey) this.context.store?.dropGame(this.modeKey);
    this.startGame();
  };

  clearGame() {
    this.context.level = 1;
    this.context.connected = 0;
    this.context.collected = 0;
    this.context.score = 0;

    this.context.stats = {};

    this.context.mission = {
      completed: false,
    };

    this.context.vertices.length = 0;
    this.context.edges.length = 0;
    this.context.hints.length = 0;
  }

  startGame() {
    this.clearGame();
    this.rules?.start();
    this.unsaved = true;
  }

  restoreGame(saved: SavedGame) {
    this.clearGame();
    this.context.level = saved.level;
    this.context.connected = saved.connected;
    this.context.collected = saved.collected;
    this.context.score = saved.score;
    this.context.stats = saved.stats ?? {};
    this.context.mission = saved.mission;

    const graph = deserializeGraph(saved);
    graph.vertices.forEach((vertex) => insertVertex(this.context, vertex));
    graph.edges.forEach((edge) => insertEdge(this.context, edge));
    graph.hints.forEach((hint) => insertHint(this.context, hint));
    this.layout.start();
    this.unsaved = false;
  }

  /** the game changed since it was last saved; saved once the board settles */
  unsaved = false;

  saveGame() {
    this.unsaved = false;
    if (!this.modeKey) return;
    this.context.store?.saveGame(this.modeKey, serializeGame(this.context));
  }

  /** Plays a turn; the board is busy, and ignores input, until it finishes */
  handleUserConnect = async (data: { source: Vertex; target: Vertex }) => {
    // if (!data.source && this.context..vertex.designing) {
    //   const target = this.insertVertex(point);
    //   this.selectItem(vertexOut);
    // }

    if (!data.source || !data.target || data.target === data.source) return;

    if (!this.canConnect(data.source, data.target)) return;

    const edge = initEdge({ source: data.source, target: data.target });

    await this.wait(10);
    insertEdge(this.context, edge);
    this.layout.start();
    await this.wait(20);
    // todo: why not entire graph?
    await this.removeMatched(findMatches(edge));
  };

  /** After turn played and match made */
  kickGame = (drops: Vertex[]) => {
    console.log("kick-on");
    this.kickState(drops);
    this.unsaved = true;
    // may start refilling the board, so kickVertices below applies to the current vertices only
    this.rules?.afterTurn(drops);
    if (this.rules?.isGameover?.() ?? false) {
      this.emit("game-over");
    }
    if (this.rules?.evolvesVertices?.() ?? true) {
      this.kickVertices();
    }
  };

  /** Update the score after each turn */
  kickState(drops: Vertex[]) {
    console.log("kick-game: " + this.context.mode.value.key);
    let collected = null;
    let score = null;
    if (drops) {
      collected = drops.length;
      score = 1;
      if (collected > 0) {
        score += Math.pow(collected, 2) + 10;
      }
      this.context.collected += collected;
      this.context.score += score;

      this.context.connected++;
    }
  }

  /** Update graph after turn, apply wildcard, bomb, rock logic */
  kickVertices() {
    DEBUG && console.log("kick-vertices");
    const rocks: Vertex[] = [];
    for (let i = this.context.vertices.length - 1; i > -1; i--) {
      const vertex = this.context.vertices[i];
      if (vertex.joker) {
        vertex.color = arrayNext(Color.four, vertex.color);
      }
      if (vertex.life > 0 && vertex.edges.length == 0 && --vertex.life == 0) {
        removeItem(this.context, vertex);
        this.layout.start();
      }
      if (vertex.color == Color.rock) {
        rocks.push(vertex);
      }
    }
    for (let i = rocks.length - 1; i > -1; i--) {
      const vertex = rocks[i];
      if (vertex.edges.length == 0) {
        removeItem(this.context, vertex);
        this.layout.start();
      }
    }
  }

  async removeMatched(matched: Matched[]) {
    await this.rules?.beforeRemove?.(matched);
    const vertices = matchVertices(matched);
    await this.wait(50);
    await this.removeAll(vertices);
    await this.wait(50);
    this.kickGame(vertices);
  }

  canConnect(source: Vertex, target: Vertex) {
    return isLinkable(source, target) && (this.rules?.canLink?.(source, target) ?? true);
  }
}
