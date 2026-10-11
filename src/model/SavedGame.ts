// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { initEdge, initHint, initVertex, type Graph, type Vertex } from "./Graph";
import { type Mission } from "./Types";

export interface SavedVertex {
  key: string;
  x: number;
  y: number;
  color?: Vertex["color"];
  life?: number;
  joker?: boolean;
}

/** an edge or a hint, by its vertices' keys */
export interface SavedLink {
  source: string;
  target: string;
}

/** A game in progress, as plain data */
export interface SavedGame {
  level: number;
  score: number;
  connected: number;
  collected: number;
  stats: Record<string, number>;
  mission: Mission;
  vertices: SavedVertex[];
  edges: SavedLink[];
  hints: SavedLink[];
}

/**
 * Keeps a game in progress for each mode, and the last mode played.
 *
 * Registered on the context by runtime/Store while it is activated.
 */
export interface GameStore {
  loadGame(mode: string): SavedGame | null;
  saveGame(mode: string, game: SavedGame): void;
  dropGame(mode: string): void;

  loadLastMode(): string | null;
  saveLastMode(mode: string): void;
}

/** The parts of the game state a saved game keeps */
interface GameState extends Required<Graph> {
  level: number;
  score: number;
  connected: number;
  collected: number;
  stats: Record<string, number>;
  mission: Mission;
}

const round = (n: number) => Math.round(n * 10) / 10;

export const serializeGame = (state: GameState): SavedGame => {
  return {
    level: state.level,
    score: state.score,
    connected: state.connected,
    collected: state.collected,
    stats: { ...state.stats },
    mission: { ...state.mission },
    vertices: state.vertices.map((v) => ({
      key: v.key,
      x: round(v.x),
      y: round(v.y),
      color: v.color,
      life: v.life,
      joker: v.joker,
    })),
    edges: state.edges.map((e) => ({ source: e.source.key, target: e.target.key })),
    hints: state.hints.map((h) => ({ source: h.source.key, target: h.target.key })),
  };
};

/**
 * A graph from vertices and links by key, as in a saved game or a tutorial level. Links to unknown
 * vertices are dropped.
 */
export const deserializeGraph = (data: {
  vertices: Partial<Vertex>[];
  edges?: SavedLink[];
  hints?: SavedLink[];
}): Required<Graph> => {
  const byKey: Record<string, Vertex> = {};
  const vertices = data.vertices.map((d) => {
    const vertex = initVertex({ ...d });
    byKey[vertex.key] = vertex;
    return vertex;
  });
  const known = (link: SavedLink) => byKey[link.source] && byKey[link.target];
  const edges = (data.edges ?? [])
    .filter(known)
    .map((link) => initEdge({ source: byKey[link.source], target: byKey[link.target] }));
  const hints = (data.hints ?? [])
    .filter(known)
    .map((link) => initHint({ source: byKey[link.source], target: byKey[link.target] }));
  return { vertices, edges, hints };
};
