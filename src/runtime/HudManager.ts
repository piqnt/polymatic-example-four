// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext, type Mission, ProgressColors, PROGRESS_WIDTH } from "../model";
import { FrameRender } from "./FrameLoop";

/**
 * The one place the runtime talks to the shell.
 *
 * Gameplay keeps writing plain fields many times a frame; once per frame this
 * copies whatever the hud shows onto `context.hud`'s signals. Signals only
 * notify when the value actually changes, so a frame that moves nothing
 * visible re-renders nothing.
 */
export class HudManager extends Middleware<MainContext> {
  constructor() {
    super();
    this.on(FrameRender, this.handleFrameRender);
  }

  handleFrameRender = () => {
    const context = this.context;
    const hud = context.hud;
    const mission = context.mission;

    hud.level.value = context.level;
    hud.score.value = context.score;
    hud.collected.value = context.collected;

    const load = context.vertices.length;
    const maxVertices = mission.maxVertices ?? 0;
    hud.load.value = load;
    hud.maxVertices.value = maxVertices;
    hud.loadVisible.value = maxVertices > 0;

    // the last quarter of the board's capacity counts down to game over
    const warning = mission.loadover && maxVertices > 0 && load / maxVertices > 3 / 4;
    hud.warningVisible.value = warning;
    if (warning) {
      hud.warningText.value = String(maxVertices - load);
    }

    this.updateProgress(mission);
  };

  updateProgress(mission: Mission) {
    const slots = this.context.hud.progress;
    // every bar is drawn against the same scale, so they stay comparable as the
    // mission's total shrinks
    const scale = mission.max ? PROGRESS_WIDTH / mission.max : 1;

    ProgressColors.forEach((color, i) => {
      const slot = slots[i];
      const value = mission[color] ?? 0;
      slot.width.value = value > 0 ? value * scale : 0;
      slot.text.value = value > 0 ? String(value) : "";
    });

    const main = slots[slots.length - 1];
    if (mission.score) {
      main.width.value = mission.score * scale;
      main.text.value = mission.score + " pts";
    } else if (mission.time) {
      main.width.value = mission.time * scale;
      main.text.value = Math.ceil(mission.time) + "s";
    } else {
      main.width.value = 0;
      main.text.value = "";
    }
  }
}
