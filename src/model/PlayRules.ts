// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type Vertex, type Edge, type Hint, type Graph } from "./Graph";
import { type Matched } from "./Types";

/**
 * Rules of the active play mode. FourBoard plays the game and calls these where modes differ.
 *
 * The active mode registers itself on the context while it is activated. Optional hooks may be
 * left out; FourBoard decides what their absence means, noted on each.
 */
export interface PlayRules {
  /** New game: common state is reset and the board is empty. Set the mission and fill the board. */
  start(): void;

  /**
   * After a turn is scored: update the mission, and start refilling the board without waiting for
   * it. The board stays busy until the refill finishes.
   */
  afterTurn(drops: Vertex[]): void;

  /** An extra linking rule, on top of the four rules. If absent, the four rules decide. */
  canLink?(source: Vertex, target: Vertex): boolean;

  /** Called before matched vertices are removed, the tutorial highlights them. */
  beforeRemove?(matched: Matched[]): Promise<void>;

  /** If absent, the game doesn't end. */
  isGameover?(): boolean;

  /** Jokers rotate, lives count down and rocks drop after each turn. If absent, they do. */
  evolvesVertices?(): boolean;
}

/** What play modes use from FourBoard, registered on the context while FourBoard is activated */
export interface Board {
  /** Insert a graph one item at a time, resolves after the last one is inserted */
  insertAll(graph: Graph): Promise<void>;

  /** Remove items one at a time, resolves after the last one is removed */
  removeAll(items: (Vertex | Edge | Hint)[]): Promise<void>;

  /** Resolves after `ms` of game time; dropped if the game is reset */
  wait(ms: number): Promise<void>;

  /** A turn or a fill is still playing, new connections are ignored until it finishes */
  busy(): boolean;
}
