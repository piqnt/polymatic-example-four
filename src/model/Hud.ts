// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Signal, signal } from "@preact/signals";

import { Color, ColorHex, type ColorType } from "./Color";

/** Width, in hud units, a full progress bar spans. */
export const PROGRESS_WIDTH = 150;

/**
 * One progress bar plus its number. The slots themselves are created once and
 * never replaced - only the signals inside them change - so a frame that moves
 * a single bar re-renders a single bar, not the whole panel.
 */
export interface ProgressSlot {
  key: string;
  color: string;
  /** bar width in hud units; 0 hides the slot */
  width: Signal<number>;
  /** number drawn under the bar; "" hides it */
  text: Signal<string>;
}

const createSlot = (key: string, color: string): ProgressSlot => ({
  key,
  color,
  width: signal(0),
  text: signal(""),
});

/** The colors that get their own progress bar, in the order they are drawn. */
export const ProgressColors: ColorType[] = [
  Color.wildcard,
  Color.bomb,
  Color.red,
  Color.green,
  Color.blue,
  Color.yellow,
];

/**
 * Everything the hud draws, mirrored out of the gameplay state once per frame
 * by runtime/HudManager. The shell only ever reads these - it never reaches
 * into vertices, edges or the mission itself.
 */
export class HudData {
  level: Signal<number>;
  score: Signal<number>;
  collected: Signal<number>;

  /** vertices on the board, and the ceiling this mode tops out at */
  load: Signal<number>;
  maxVertices: Signal<number>;
  loadVisible: Signal<boolean>;

  /** the "n more and you're out" count, shown as the board fills up */
  warningText: Signal<string>;
  warningVisible: Signal<boolean>;

  progress: ProgressSlot[];

  constructor() {
    this.level = signal(0);
    this.score = signal(0);
    this.collected = signal(0);

    this.load = signal(0);
    this.maxVertices = signal(0);
    this.loadVisible = signal(false);

    this.warningText = signal("");
    this.warningVisible = signal(false);

    this.progress = [
      ...ProgressColors.map((color) => createSlot(color, ColorHex[color])),
      // the mode's own headline bar - score to next level, or seconds left
      createSlot("main", ColorHex[Color.rock]),
    ];
  }
}
