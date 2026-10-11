// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { nanoid } from "nanoid";

export function uniqueId(type: string) {
  return type + "-" + nanoid(8);
}

/** @internal */
const reuse_odds: number[] = [];

export function isNumeric(n: any) {
  return typeof n === "number" || (+n === parseFloat(n) && isFinite(n));
}

export function randomNumber(min: number, max?: number) {
  if (!isNumeric(max)) {
    max = min;
    min = 0;
  }
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function wrapNumber(num: number, min: number, max: number) {
  if (typeof min === "undefined") {
    max = 1;
    min = 0;
  } else if (typeof max === "undefined") {
    max = min;
    min = 0;
  }
  if (max > min) {
    num = (num - min) % (max - min);
    return num + (num < 0 ? max : min);
  } else {
    num = (num - max) % (min - max);
    return num + (num <= 0 ? min : max);
  }
}

export function spinWheel<V, P>(
  options: {
    value: V;
    weight?: number | ((data: P) => number);
  }[],
  param: P,
) {
  const length = options.length;
  let total = 0;
  for (let i = 0; i < length; i++) {
    const option = options[i];
    if (typeof option.weight === "function") {
      reuse_odds[i] = option.weight(param);
    } else if (typeof option.weight === "number") {
      reuse_odds[i] = option.weight;
    } else {
      reuse_odds[i] = 1;
    }

    if (reuse_odds[i] > 0) {
      total += reuse_odds[i];
    }
  }

  if (!total) {
    return;
  }

  let random = Math.random() * total;
  let selected: V;
  for (let i = 0; i < length; i++) {
    const option = options[i];
    selected = option.value; // let last one be selected
    random -= reuse_odds[i];
    if (random < 0) break;
  }
  return selected;
}

export function arrayRepeat<T>(n: number, value: T) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    arr[i] = value;
  }
  return arr;
}

export function arraySample<T>(array: T[], n: number): T[] {
  n = Math.min(n, array.length);
  const copy = array.slice(0);
  const sample = [];
  for (let i = 0; i < n; i++) {
    sample.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return sample;
}

export function arraySampleOne<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function arrayDrop<T>(array: T[], item: T): T {
  const index = array.indexOf(item);
  if (index > -1) array.splice(index, 1);
  return item;
}

export function arrayNext<T>(array: T[], item: T, n = 1): T {
  const i = (array.indexOf(item) + n) % array.length;
  return array[i < 0 ? i + array.length : i];
}

export function arrayAt<T>(array: T[], i: number): T {
  i = array.length > 1 ? i % array.length : 0;
  i = i < 0 ? i + array.length : i;
  return array[i];
}
