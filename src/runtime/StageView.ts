// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import { type MainContext } from "../model";

/**
 * Sets up the stage the graph is drawn on: the viewbox everything is laid out
 * in, the background, and the screen component the graph is appended to.
 *
 * This used to be the first half of Terminal, which drew the hud onto the same
 * stage. The hud is DOM now (see shell/), so all that is left here is the
 * playfield itself - and this has to run before GraphView, which appends into
 * `context.screen`.
 */
export class StageView extends Middleware<MainContext> {
  inited = false;

  constructor() {
    super();
    this.on("activate", this.handleActivate);
  }

  handleActivate = () => {
    if (this.inited) return;
    this.inited = true;

    this.context.stage.viewbox(400, 600);

    const background = Stage.sprite("background");
    background.appendTo(this.context.stage);
    background.pin("align", 0.5);
    background.maximize();
    background.stretch();

    const screen = Stage.component();
    this.context.screen = screen;
    screen.appendTo(this.context.stage);
    screen.maximize();
  };
}
