// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type MainContext, type PromptConfig, PlayModeByKey } from "../model";

// The modal copy, kept together and away from the components that show it.
// These read plain gameplay fields rather than hud signals: a prompt is built
// once, at the moment it opens, so it wants the value now and no subscription.

export const promptReset = (context: MainContext): PromptConfig => {
  return {
    message: "Reset?",
    actions: [
      { text: "Yes", value: "prompt-action-restart-yes" },
      { text: "No", value: "prompt-action-restart-no" },
    ],
  };
};

export const promptStats = (context: MainContext): PromptConfig => {
  const msg: string[] = [];
  if (context.mission.time) {
    msg.push("Time: " + Math.ceil(context.mission.time) + "s");
  } else {
    msg.push("Level: " + context.level);
  }

  msg.push("Score: " + context.score);
  msg.push("Removed: " + context.collected);
  msg.push("Connected: " + context.connected);
  msg.push("Load: " + context.vertices.length + (context.mission.maxVertices ? "/" + context.mission.maxVertices : ""));

  return {
    message: msg.join("\n"),
    actions: [{ text: "Ok", value: "prompt-action-stats-ok" }],
  };
};

export const promptProgress = (context: MainContext): PromptConfig => {
  const mode = context.mode.value;
  let message = "Progress";
  if (mode === PlayModeByKey.collect) {
    message = "Colors to next level";
  } else if (mode === PlayModeByKey.stream) {
    message = "Score to next level";
  } else if (mode === PlayModeByKey.speed) {
    message = "Seconds to time over";
  }
  return {
    message,
    actions: [{ text: "Ok", value: "prompt-action-progress-ok" }],
  };
};
