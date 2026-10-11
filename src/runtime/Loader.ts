// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import * as Stage from "stage-js";
import { Middleware } from "polymatic";

import bgImage from "../../media/bg.jpg";
import fourImage from "../../media/four.png";

import { type MainContext } from "../model";

/** Loads assets and prepares the stage */
export class Loader extends Middleware<MainContext> {
  constructor() {
    super();
    this.on("activate", this.handleActivate);
  }

  async handleActivate() {
    await Stage.atlas({
      name: "background",
      image: {
        src: bgImage,
        ratio: 8,
      },
    });

    await Stage.atlas({
      name: "four",
      image: {
        src: fourImage,
        ratio: 2,
      },
      filter: (sprite) => {
        sprite.y = 256 - (sprite.y + sprite.height);
        return sprite;
      },

      textures: {
        "vertex_red": { x: 0 * 30, y: 98, width: 30, height: 30 },
        "vertex_green": { x: 1 * 30, y: 98, width: 30, height: 30 },
        "vertex_blue": { x: 2 * 30, y: 98, width: 30, height: 30 },
        "vertex_yellow": { x: 3 * 30, y: 98, width: 30, height: 30 },
        "vertex_wildcard": { x: 4 * 30, y: 98, width: 30, height: 30 },
        "vertex_bomb": { x: 5 * 30, y: 98, width: 30, height: 30 },

        "vertex_red_dashed": { x: 0 * 30, y: 68, width: 30, height: 30 },
        "vertex_green_dashed": { x: 1 * 30, y: 68, width: 30, height: 30 },
        "vertex_blue_dashed": { x: 2 * 30, y: 68, width: 30, height: 30 },
        "vertex_yellow_dashed": { x: 3 * 30, y: 68, width: 30, height: 30 },
        "vertex_wildcard_dashed": { x: 4 * 30, y: 68, width: 30, height: 30 },
        "vertex_bomb_dashed": { x: 5 * 30, y: 68, width: 30, height: 30 },

        "vertex_rock": { x: 6 * 30, y: 68, width: 30, height: 30 },
        "vertex_muted": { x: 6 * 30, y: 68, width: 30, height: 30 },

        "bar_red": { x: 199, y: 130 + 6 * 15, width: 22, height: 15, left: 5, right: 5 },
        "bar_green": { x: 199, y: 130 + 5 * 15, width: 22, height: 15, left: 5, right: 5 },
        "bar_blue": { x: 199, y: 130 + 4 * 15, width: 22, height: 15, left: 5, right: 5 },
        "bar_yellow": { x: 199, y: 130 + 3 * 15, width: 22, height: 15, left: 5, right: 5 },
        "bar_wildcard": { x: 199, y: 130 + 2 * 15, width: 22, height: 15, left: 5, right: 5 },
        "bar_bomb": { x: 199, y: 130 + 1 * 15, width: 22, height: 15, left: 5, right: 5 },
        "bar_rock": { x: 199, y: 130 + 0 * 15, width: 22, height: 15, left: 5, right: 5 },

        "edge": { x: 0, y: 7, width: 512, height: 5 },
        "edge_dashed": { x: 0, y: 1, width: 512, height: 5 },
        "edge_muted": { x: 0, y: 13, width: 512, height: 1 },

        "drag-in": { x: 310, y: 150, width: 100, height: 100 },
        "drag-out": { x: 410, y: 150, width: 100, height: 100 },

        "window": { x: 230, y: 170, width: 20, height: 18, top: 1, bottom: 1, left: 1, right: 1 },
        "button": { x: 230, y: 190, width: 20, height: 18, top: 1, bottom: 8, left: 1, right: 1 },

        "mode_learn": { x: 232 + 0 * 40, y: 98, width: 46, height: 45 },
        "mode_collect": { x: 232 + 1 * 40, y: 98, width: 46, height: 45 },
        "mode_speed": { x: 232 + 2 * 40, y: 98, width: 46, height: 45 },
        "mode_stream": { x: 232 + 3 * 40, y: 98, width: 46, height: 45 },
        "mode_cross": { x: 232 + 4 * 40, y: 98, width: 46, height: 45 },
        "help": { x: 232 + 5 * 40, y: 98, width: 46, height: 45 },
        "menu_learn": { x: 232 + 0 * 40, y: 102, width: 46, height: 39 },
        "menu_collect": { x: 232 + 1 * 40, y: 102, width: 46, height: 39 },
        "menu_speed": { x: 232 + 2 * 40, y: 102, width: 46, height: 39 },
        "menu_stream": { x: 232 + 3 * 40, y: 102, width: 46, height: 39 },
        "menu_cross": { x: 232 + 4 * 40, y: 102, width: 46, height: 39 },
        "menu": { x: 232 + 4 * 40, y: 102, width: 6, height: 39, left: 2, right: 2 },

        "player_1": { x: 300 + 0 * 20, y: 10, width: 20, height: 20 },
        "player_2": { x: 300 + 1 * 20, y: 10, width: 20, height: 20 },
        "player_3": { x: 300 + 2 * 20, y: 10, width: 20, height: 20 },
        "player_4": { x: 300 + 3 * 20, y: 10, width: 20, height: 20 },

        "digit": {
          "0": { x: 15 * 15, y: 64, width: 13, height: 24 },
          "1": { x: 16 * 15, y: 64, width: 13, height: 24 },
          "2": { x: 17 * 15, y: 64, width: 13, height: 24 },
          "3": { x: 18 * 15, y: 64, width: 13, height: 24 },
          "4": { x: 19 * 15, y: 64, width: 13, height: 24 },
          "5": { x: 20 * 15, y: 64, width: 13, height: 24 },
          "6": { x: 21 * 15, y: 64, width: 13, height: 24 },
          "7": { x: 22 * 15, y: 64, width: 13, height: 24 },
          "8": { x: 23 * 15, y: 64, width: 13, height: 24 },
          "9": { x: 24 * 15, y: 64, width: 13, height: 24 },
          "-": { x: 25 * 15, y: 64, width: 8, height: 24 },
          "!": { x: 26 * 15, y: 64, width: 6, height: 24 },
          ":": { x: 27 * 15, y: 64, width: 6, height: 24 },
          "?": { x: 28 * 15, y: 64, width: 10, height: 24 },
          ">": { x: 29 * 15, y: 64, width: 11, height: 24 },
          "^": { x: 30 * 15, y: 64, width: 10, height: 24 },
          "<": { x: 31 * 15, y: 64, width: 11, height: 24 },
          "/": { x: 32 * 15, y: 64, width: 14, height: 24 },
          " ": { x: 33 * 15, y: 64, width: 10, height: 24 },

          "a": { x: 0 * 15, y: 14, width: 15, height: 24 },
          "b": { x: 1 * 15, y: 14, width: 15, height: 24 },
          "c": { x: 2 * 15, y: 14, width: 15, height: 24 },
          "d": { x: 3 * 15, y: 14, width: 15, height: 24 },
          "e": { x: 4 * 15, y: 14, width: 15, height: 24 },
          "f": { x: 5 * 15, y: 14, width: 15, height: 24 },
          "g": { x: 6 * 15, y: 14, width: 15, height: 24 },
          "h": { x: 7 * 15, y: 14, width: 15, height: 24 },
          "i": { x: 8 * 15, y: 14, width: 15, height: 24 },
          "j": { x: 9 * 15, y: 14, width: 15, height: 24 },
          "k": { x: 10 * 15, y: 14, width: 15, height: 24 },
          "l": { x: 11 * 15, y: 14, width: 15, height: 24 },
          "m": { x: 12 * 15, y: 14, width: 15, height: 24 },
          "n": { x: 13 * 15, y: 14, width: 15, height: 24 },
          "o": { x: 14 * 15, y: 14, width: 15, height: 24 },
          "p": { x: 15 * 15, y: 14, width: 15, height: 24 },
          "q": { x: 16 * 15, y: 14, width: 15, height: 24 },
          "r": { x: 17 * 15, y: 14, width: 15, height: 24 },
          "s": { x: 18 * 15, y: 14, width: 15, height: 24 },
          "t": { x: 19 * 15, y: 14, width: 15, height: 24 },
          "u": { x: 20 * 15, y: 14, width: 15, height: 24 },
          "v": { x: 21 * 15, y: 14, width: 15, height: 24 },
          "w": { x: 22 * 15, y: 14, width: 15, height: 24 },
          "x": { x: 23 * 15, y: 14, width: 15, height: 24 },
          "y": { x: 24 * 15, y: 14, width: 15, height: 24 },
          "z": { x: 25 * 15, y: 14, width: 15, height: 24 },

          "A": { x: 0 * 15, y: 39, width: 15, height: 24 },
          "B": { x: 1 * 15, y: 39, width: 15, height: 24 },
          "C": { x: 2 * 15, y: 39, width: 15, height: 24 },
          "D": { x: 3 * 15, y: 39, width: 15, height: 24 },
          "E": { x: 4 * 15, y: 39, width: 15, height: 24 },
          "F": { x: 5 * 15, y: 39, width: 15, height: 24 },
          "G": { x: 6 * 15, y: 39, width: 15, height: 24 },
          "H": { x: 7 * 15, y: 39, width: 15, height: 24 },
          "I": { x: 8 * 15, y: 39, width: 15, height: 24 },
          "J": { x: 9 * 15, y: 39, width: 15, height: 24 },
          "K": { x: 10 * 15, y: 39, width: 15, height: 24 },
          "L": { x: 11 * 15, y: 39, width: 15, height: 24 },
          "M": { x: 12 * 15, y: 39, width: 15, height: 24 },
          "N": { x: 13 * 15, y: 39, width: 15, height: 24 },
          "O": { x: 14 * 15, y: 39, width: 15, height: 24 },
          "P": { x: 15 * 15, y: 39, width: 15, height: 24 },
          "Q": { x: 16 * 15, y: 39, width: 15, height: 24 },
          "R": { x: 17 * 15, y: 39, width: 15, height: 24 },
          "S": { x: 18 * 15, y: 39, width: 15, height: 24 },
          "T": { x: 19 * 15, y: 39, width: 15, height: 24 },
          "U": { x: 20 * 15, y: 39, width: 15, height: 24 },
          "V": { x: 21 * 15, y: 39, width: 15, height: 24 },
          "W": { x: 22 * 15, y: 39, width: 15, height: 24 },
          "X": { x: 23 * 15, y: 39, width: 15, height: 24 },
          "Y": { x: 24 * 15, y: 39, width: 15, height: 24 },
          "Z": { x: 25 * 15, y: 39, width: 15, height: 24 },
        },

        "digit_red": {
          // red
          "0": { x: 0 * 20, y: 230, width: 12, height: 17 },
          "1": { x: 1 * 20, y: 230, width: 12, height: 17 },
          "2": { x: 2 * 20, y: 230, width: 12, height: 17 },
          "3": { x: 3 * 20, y: 230, width: 12, height: 17 },
          "4": { x: 4 * 20, y: 230, width: 12, height: 17 },
          "5": { x: 5 * 20, y: 230, width: 12, height: 17 },
          "6": { x: 6 * 20, y: 230, width: 12, height: 17 },
          "7": { x: 7 * 20, y: 230, width: 12, height: 17 },
          "8": { x: 8 * 20, y: 230, width: 12, height: 17 },
          "9": { x: 9 * 20, y: 230, width: 12, height: 17 },
        },

        "digit_green": {
          // green
          "0": { x: 0 * 20, y: 210, width: 12, height: 17 },
          "1": { x: 1 * 20, y: 210, width: 12, height: 17 },
          "2": { x: 2 * 20, y: 210, width: 12, height: 17 },
          "3": { x: 3 * 20, y: 210, width: 12, height: 17 },
          "4": { x: 4 * 20, y: 210, width: 12, height: 17 },
          "5": { x: 5 * 20, y: 210, width: 12, height: 17 },
          "6": { x: 6 * 20, y: 210, width: 12, height: 17 },
          "7": { x: 7 * 20, y: 210, width: 12, height: 17 },
          "8": { x: 8 * 20, y: 210, width: 12, height: 17 },
          "9": { x: 9 * 20, y: 210, width: 12, height: 17 },
        },

        "digit_blue": {
          // blue
          "0": { x: 0 * 20, y: 190, width: 12, height: 17 },
          "1": { x: 1 * 20, y: 190, width: 12, height: 17 },
          "2": { x: 2 * 20, y: 190, width: 12, height: 17 },
          "3": { x: 3 * 20, y: 190, width: 12, height: 17 },
          "4": { x: 4 * 20, y: 190, width: 12, height: 17 },
          "5": { x: 5 * 20, y: 190, width: 12, height: 17 },
          "6": { x: 6 * 20, y: 190, width: 12, height: 17 },
          "7": { x: 7 * 20, y: 190, width: 12, height: 17 },
          "8": { x: 8 * 20, y: 190, width: 12, height: 17 },
          "9": { x: 9 * 20, y: 190, width: 12, height: 17 },
        },

        "digit_yellow": {
          // yellow
          "0": { x: 0 * 20, y: 170, width: 12, height: 17 },
          "1": { x: 1 * 20, y: 170, width: 12, height: 17 },
          "2": { x: 2 * 20, y: 170, width: 12, height: 17 },
          "3": { x: 3 * 20, y: 170, width: 12, height: 17 },
          "4": { x: 4 * 20, y: 170, width: 12, height: 17 },
          "5": { x: 5 * 20, y: 170, width: 12, height: 17 },
          "6": { x: 6 * 20, y: 170, width: 12, height: 17 },
          "7": { x: 7 * 20, y: 170, width: 12, height: 17 },
          "8": { x: 8 * 20, y: 170, width: 12, height: 17 },
          "9": { x: 9 * 20, y: 170, width: 12, height: 17 },
        },

        "digit_wildcard": {
          // white
          "0": { x: 0 * 20, y: 150, width: 12, height: 17 },
          "1": { x: 1 * 20, y: 150, width: 12, height: 17 },
          "2": { x: 2 * 20, y: 150, width: 12, height: 17 },
          "3": { x: 3 * 20, y: 150, width: 12, height: 17 },
          "4": { x: 4 * 20, y: 150, width: 12, height: 17 },
          "5": { x: 5 * 20, y: 150, width: 12, height: 17 },
          "6": { x: 6 * 20, y: 150, width: 12, height: 17 },
          "7": { x: 7 * 20, y: 150, width: 12, height: 17 },
          "8": { x: 8 * 20, y: 150, width: 12, height: 17 },
          "9": { x: 9 * 20, y: 150, width: 12, height: 17 },
        },

        "digit_bomb": {
          // black
          "0": { x: 0 * 20, y: 130, width: 12, height: 17 },
          "1": { x: 1 * 20, y: 130, width: 12, height: 17 },
          "2": { x: 2 * 20, y: 130, width: 12, height: 17 },
          "3": { x: 3 * 20, y: 130, width: 12, height: 17 },
          "4": { x: 4 * 20, y: 130, width: 12, height: 17 },
          "5": { x: 5 * 20, y: 130, width: 12, height: 17 },
          "6": { x: 6 * 20, y: 130, width: 12, height: 17 },
          "7": { x: 7 * 20, y: 130, width: 12, height: 17 },
          "8": { x: 8 * 20, y: 130, width: 12, height: 17 },
          "9": { x: 9 * 20, y: 130, width: 12, height: 17 },
        },
      },
    });

    this.context.stage = Stage.mount();

    this.emit("loader-ready");
  }
}
