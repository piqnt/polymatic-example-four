// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type MainContext, type PromptAction, PlayModeByKey, PlayableModes } from "../model";
import { Loader } from "./Loader";
import { Disk } from "./Store";
import { FrameLoop } from "./FrameLoop";
import { StageView } from "./StageView";
import { GraphView } from "./GraphView";
import { GraphInput } from "./GraphInput";
import { GraphScale } from "./GraphScale";
import { HudManager } from "./HudManager";
import { FourBoard } from "./PlayFour";
import { PlayModeSwitch } from "./PlayModeSwitch";
import { PlayCollect } from "./PlayCollect";
import { PlayStream } from "./PlayStream";
import { PlayCross } from "./PlayCross";
import { PlayLearn } from "./PlayTutorial";

/**
 * The runtime. It owns the playfield and the game state; the hud and the
 * modals are the shell's (see shell/App), and the two meet at the signals on
 * MainContext - written here by HudManager, read there while rendering.
 */
export class Main extends Middleware<MainContext> {
  constructor() {
    super();
    this.use(new Disk());
    this.use(new Loader());
    this.use(new FrameLoop());

    this.on("loader-ready", this.handleLoaderReady);
    this.on("modal-action", this.handlePromptAction);
  }

  handleLoaderReady = () => {
    this.use(new StageView());
    this.use(new FourBoard());
    this.use(
      new PlayModeSwitch()
        .case("collect", new PlayCollect())
        .case("stream", new PlayStream())
        .case("cross", new PlayCross())
        .case("learn", new PlayLearn()),
    );
    this.use(new GraphView());
    // before GraphScale, so dragging a connection stops the graph from rotating and zooming
    this.use(new GraphInput());
    this.use(new GraphScale());
    this.use(new HudManager());

    // continue with the last mode played
    const last = this.context.store?.loadLastMode();
    this.emit("set-mode", PlayableModes.find((mode) => mode.key === last) ?? PlayModeByKey.default);
  };

  handlePromptAction = (action: PromptAction) => {
    if (action?.value === "prompt-action-restart-yes") {
      this.emit("game-reset");
    }
  };
}
