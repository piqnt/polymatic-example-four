// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import fourImage from "../../media/four.png";

/**
 * Draws a sprite out of the same atlas the game renders from, as a css
 * background - so the mode badges in the DOM hud are the artwork, not a
 * lookalike.
 *
 * The coordinates are the atlas's own: the png is twice that size (the atlas is
 * declared with ratio 2 in runtime/Loader), and its y axis is measured from the
 * bottom, which is what that loader's `filter` flips.
 */
const ATLAS_WIDTH = 512;
const ATLAS_HEIGHT = 256;

export interface AtlasRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function atlasStyle(rect: AtlasRect, scale = 1) {
  return {
    backgroundImage: `url(${fourImage})`,
    backgroundSize: `${ATLAS_WIDTH * scale}px ${ATLAS_HEIGHT * scale}px`,
    backgroundPosition: `-${rect.x * scale}px -${(ATLAS_HEIGHT - (rect.y + rect.height)) * scale}px`,
    width: `${rect.width * scale}px`,
    height: `${rect.height * scale}px`,
  };
}

// same rows runtime/Loader names "mode_*" and "menu_*"
const MODE_ORDER = ["learn", "collect", "speed", "stream", "cross"];

export function modeBadge(key: string): AtlasRect {
  const index = Math.max(0, MODE_ORDER.indexOf(key));
  return { x: 232 + index * 40, y: 98, width: 46, height: 45 };
}

export function modeIcon(key: string): AtlasRect {
  const index = Math.max(0, MODE_ORDER.indexOf(key));
  return { x: 232 + index * 40, y: 102, width: 46, height: 39 };
}
