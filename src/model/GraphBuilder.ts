// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { Graph, createGraphComplete, createGraphOne, createGraphStar, createGraphTree } from "./Graph";
import { Color, randomColorMany } from "./Color";
import { randomNumber, spinWheel } from "./Util";

interface SpinnerOption<V, P> {
  value: V;
  weight?: number | ((data: P) => number);
}

class Spinner<T, P> {
  _options: SpinnerOption<T, P>[] = [];
  _prob: number;
  constructor(_prob: number) {
    this._prob = _prob;
  }
  add = (value: T, weight: (param: P) => number = () => 1) => {
    this._options.push({ value, weight });
    return this;
  };
  test = () => {
    return Math.random() < this._prob ? true : false;
  };
  random(param: P): T {
    return spinWheel(this._options, param);
  }
}

export const randomGraphBase = new Spinner<(graph: Graph) => void, number>(0.08);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphComplete(graph, randomColorMany(3, 3));
  },
  function (level: number) {
    return level < 2 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphTree(graph, 2, randomColorMany(3, 3));
  },
  function (level: number) {
    return level < 2 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphOne(graph, { joker: true });
  },
  function (level: number) {
    return level < 3 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphTree(graph, 3, randomColorMany(3, 3));
  },
  function (level: number) {
    return level < 3 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphStar(graph, randomColorMany(4, randomNumber(1, 4)));
  },
  function (level: number) {
    return level < 4 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphComplete(graph, randomColorMany(4, randomNumber(1, 4)));
  },
  function (level: number) {
    return level < 4 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphStar(graph, randomColorMany(5, randomNumber(1, 5)));
  },
  function (level: number) {
    return level < 5 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphTree(graph, 2, randomColorMany(3, 2));
  },
  function (level: number) {
    return level < 5 ? 0 : 1;
  },
);
randomGraphBase.add(
  function (graph: Graph) {
    createGraphTree(graph, 3, randomColorMany(3, 2));
  },
  function (level: number) {
    return level < 6 ? 0 : 1;
  },
);

export const randomBWBase = new Spinner<(graph: Graph) => void, number>(0.2);
randomBWBase.add(function (graph: Graph) {
  createGraphOne(graph, Color.wildcard);
});
randomBWBase.add(function (graph: Graph) {
  createGraphOne(graph, Color.bomb);
});

export const randomGraphSpeed = new Spinner<(graph: Graph) => void, number>(0.12);
randomGraphSpeed.add(
  function (graph: Graph) {
    createGraphComplete(graph, randomColorMany(3, 3));
  },
  function (level: number) {
    return level < 2 ? 0 : 1;
  },
);
randomGraphSpeed.add(
  function (graph: Graph) {
    createGraphStar(graph, randomColorMany(3, randomNumber(1, 3)));
  },
  function (level: number) {
    return level < 3 ? 0 : 1;
  },
);
randomGraphSpeed.add(
  function (graph: Graph) {
    createGraphStar(graph, randomColorMany(4, randomNumber(1, 4)));
  },
  function (level: number) {
    return level < 4 ? 0 : 1;
  },
);
randomGraphSpeed.add(
  function (graph: Graph) {
    createGraphStar(graph, randomColorMany(5, randomNumber(1, 5)));
  },
  function (level: number) {
    return level < 2 ? 0 : 1;
  },
);
