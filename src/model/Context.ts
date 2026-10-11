// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import type * as Stage from "stage-js";
import { Signal, signal } from "@preact/signals";

import { type Vertex, type Edge, type Hint } from "./Graph";
import { type Drag } from "./Drag";
import { type Mission } from "./Types";
import { type PlayMode } from "./PlayMode";
import { type PromptConfig } from "./Prompt";
import { HudData } from "./Hud";
import { type PlayRules, type Board } from "./PlayRules";
import { type GameStore } from "./SavedGame";

/**
 * Global context, shared between the runtime and the shell.
 *
 * The plain fields belong to the runtime: they are read and written many times
 * a frame, and no component ever touches them. The signals are the bridge - the
 * runtime writes them, the shell subscribes to them by reading `.value` while
 * it renders. Per-frame readouts are mirrored onto `hud` once per frame by
 * runtime/HudManager rather than being signals at the source, so the shell
 * re-renders when a displayed number changes and not on every frame.
 */
export class MainContext {
  /** rules of the active play mode, registered by the mode while it is activated */
  rules: PlayRules | null = null;
  /** FourBoard, for play modes */
  board: Board | null = null;
  /** saved games, see runtime/Store */
  store: GameStore | null = null;

  stage?: Stage.Root;
  screen?: Stage.Component;
  graph?: Stage.Component;

  // the graph being played
  vertices: Vertex[] = [];
  edges: Edge[] = [];
  hints: Hint[] = [];

  drag: Drag | null = null;

  level = 0;
  score = 0;
  connected = 0;
  collected = 0;

  stats: Record<string, number> = {};

  mission: Mission = {};

  // --- shell facing state ---

  /** assets loaded and the first mode swapped in; the shell draws nothing before this */
  ready: Signal<boolean>;

  /** which mode is playing - the shell draws its badge and marks it in the menu */
  mode: Signal<PlayMode | null>;

  /** the open modal, or null; see model/Prompt */
  prompt: Signal<PromptConfig | null>;

  modeMenuOpen: Signal<boolean>;

  hud: HudData;

  constructor() {
    this.ready = signal(false);
    this.mode = signal<PlayMode | null>(null);
    this.prompt = signal<PromptConfig | null>(null);
    this.modeMenuOpen = signal(false);
    this.hud = new HudData();
  }
}
