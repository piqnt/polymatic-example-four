// Copyright (c) Ali Shakiba
// Licensed under the MIT License

/**
 * The roster of play modes. Plain data, shared by both layers: the runtime
 * swaps middleware on it (see runtime/PlayModeSwitch), the shell draws the
 * mode button and mode menu from it.
 */
export interface PlayMode {
  key: string;
  name?: string;
}

// old keys: 1 - stream, 2 - cross, 3 - learn, 4 - collect, 5 - test, 6 - speed

const stream: PlayMode = { key: "stream", name: "Score Mode" };
const cross: PlayMode = { key: "cross", name: "Cross Mode" };
const learn: PlayMode = { key: "learn", name: "Tutorial" };
const collect: PlayMode = { key: "collect", name: "Colors Mode" };
const test: PlayMode = { key: "test" };
const speed: PlayMode = { key: "speed", name: "60s Mode" };

export const PlayModeByKey = {
  default: collect,
  stream: stream,
  cross: cross,
  learn: learn,
  collect: collect,
  test: test,
  speed: speed,
};

export const PlayableModes = [learn, collect, stream, cross];
