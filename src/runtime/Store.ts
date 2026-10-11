// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Middleware } from "polymatic";

import { type GameStore, type MainContext, type SavedGame } from "../model";

const GAME_KEY_PREFIX = "four-v2-game-data-";
const LAST_MODE_KEY = "four-v2-mode";

/** Keeps saved games and the last mode in localStorage; registered as `context.store` */
export class Disk extends Middleware<MainContext> implements GameStore {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
    this.on("deactivate", this.handleDeactivate);
  }

  handleActivate = () => {
    this.context.store = this;
  };

  handleDeactivate = () => {
    if (this.context.store === this) {
      this.context.store = null;
    }
  };

  loadGame(mode: string): SavedGame | null {
    try {
      const string = localStorage.getItem(GAME_KEY_PREFIX + mode);
      if (!string) return null;
      const game = JSON.parse(string);
      // a save from an older version of this format is ignored
      if (!Array.isArray(game?.vertices) || !game.mission) return null;
      return game;
    } catch (e) {
      console.warn("Could not load the saved game", e);
      return null;
    }
  }

  saveGame(mode: string, game: SavedGame) {
    try {
      localStorage.setItem(GAME_KEY_PREFIX + mode, JSON.stringify(game));
    } catch (e) {
      console.warn("Could not save the game", e);
    }
  }

  dropGame(mode: string) {
    try {
      localStorage.removeItem(GAME_KEY_PREFIX + mode);
    } catch (e) {
      console.warn("Could not remove the saved game", e);
    }
  }

  loadLastMode(): string | null {
    try {
      return localStorage.getItem(LAST_MODE_KEY);
    } catch (e) {
      return null;
    }
  }

  saveLastMode(mode: string) {
    try {
      localStorage.setItem(LAST_MODE_KEY, mode);
    } catch (e) {
      console.warn("Could not save the mode", e);
    }
  }
}
