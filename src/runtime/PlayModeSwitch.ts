// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";
import { effect } from "@preact/signals";

import { type MainContext, type PlayMode } from "../model";

interface Case {
  key: string;
  middleware: Middleware<any>;
}

/**
 * Runs the play mode keyed by `context.mode`, and sets it on "set-mode". The shell draws the mode
 * badge and menu from `context.mode` too.
 *
 * Modes are added as cases, see Main. Only the current mode is in the tree, so the others neither
 * run nor receive events.
 */
export class PlayModeSwitch extends Middleware<MainContext> {
  private cases: Case[] = [];
  private dispose: (() => void) | null = null;

  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
    this.on("set-mode", this.handleSetMode);
  }

  /**
   * Add a mode. The switch's context must provide what the mode needs. A mode added while the
   * switch is active is used right away if it is current.
   */
  case<T>(this: PlayModeSwitch & Middleware<NoInfer<T>>, key: string, middleware: Middleware<T>): PlayModeSwitch {
    this.cases.push({ key, middleware });
    // the effect only runs again when the mode changes
    if (this.activated && this.context.mode.value?.key === key) {
      (this as Middleware<any>).use(middleware);
    }
    return this;
  }

  handleSetMode = (mode: PlayMode) => {
    if (!mode) return;
    this.context.mode.value = mode;
    this.context.store?.saveLastMode(mode.key);
  };

  handleActivate = () => {
    this.dispose = effect(() => {
      const key = this.context.mode.value?.key;
      // remove the previous mode before using the next, since modes share the board
      for (const c of this.cases) {
        if (c.key !== key) {
          this.unuse(c.middleware);
        }
      }
      for (const c of this.cases) {
        if (c.key === key) {
          (this as Middleware<any>).use(c.middleware);
          // the switch is only added once assets are loaded, so the shell can draw now
          this.context.ready.value = true;
        }
      }
    });
  };

  handleDeactivate = () => {
    this.dispose?.();
    this.dispose = null;
    for (const c of this.cases) {
      this.unuse(c.middleware);
    }
  };
}
