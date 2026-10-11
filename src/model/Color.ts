// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { randomNumber, arrayAt, arraySample, arraySampleOne } from "./Util";

export type ColorType = "rock" | "red" | "green" | "blue" | "yellow" | "wildcard" | "bomb" | "joker";

export const Color = {
  rock: "rock" as "rock",
  red: "red" as "red",
  green: "green" as "green",
  blue: "blue" as "blue",
  yellow: "yellow" as "yellow",
  wildcard: "wildcard" as "wildcard",
  bomb: "bomb" as "bomb",
  joker: "joker" as "joker",
  get four() {
    return [Color.red, Color.green, Color.blue, Color.yellow];
  },
  get collectible() {
    return [Color.red, Color.yellow, Color.green, Color.blue, Color.wildcard, Color.bomb];
  },
};

/**
 * The same palette the sprite atlas is drawn in (media/four.png), as css - the
 * hud moved to the DOM, so its bars and numbers need the colors as values
 * rather than as textures.
 */
export const ColorHex: Record<ColorType, string> = {
  rock: "#cccccc",
  red: "#ff2a2a",
  green: "#37c871",
  blue: "#2c5aa0",
  yellow: "#ffd92f",
  wildcard: "#ffffff",
  bomb: "#4d4d4d",
  joker: "#ffffff",
};

export const colorLife = (color: ColorType) => {
  if (color == Color.bomb || color == Color.wildcard) {
    return 1;
  }
  return -1;
};

export const randomColorOne = () => {
  return arraySampleOne(Color.four);
};

export const randomColorMany = (length: number, nColors = randomNumber(1, length)): ColorType[] => {
  const colors = arraySample(Color.four, nColors);
  const result: ColorType[] = [];
  for (let i = 0; i < length; i++) {
    result.push(arrayAt(colors, i));
  }
  return result;
};
