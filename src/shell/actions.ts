// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type PlayMode, type PromptAction } from "../model";
import { type GameRuntime } from "./context";
import { promptProgress, promptReset, promptStats } from "./prompts";

// Everything a control can do, in one file. Components call these; they never
// reach for a signal or emit an event inline.

/** @action */
export function toggleModeMenu({ context }: GameRuntime) {
  context.modeMenuOpen.value = !context.modeMenuOpen.value;
}

/** @action */
export function closeModeMenu({ context }: GameRuntime) {
  context.modeMenuOpen.value = false;
}

/** Picking the mode you are already in offers to restart it instead. */
/** @action */
export function selectMode({ context, emit }: GameRuntime, mode: PlayMode) {
  context.modeMenuOpen.value = false;
  if (mode === context.mode.value) {
    context.prompt.value = promptReset(context);
  } else {
    emit("set-mode", mode);
  }
}

/** @action */
export function showStats({ context }: GameRuntime) {
  context.prompt.value = promptStats(context);
}

/** @action */
export function showProgress({ context }: GameRuntime) {
  context.prompt.value = promptProgress(context);
}

/**
 * Answering a modal closes it and hands the answer to the runtime, which is
 * where "reset" and friends are acted on (see runtime/Main).
 */
/** @action */
export function answerPrompt({ context, emit }: GameRuntime, action: PromptAction) {
  context.prompt.value = null;
  emit("modal-action", action);
}

/** Dismissing without picking anything - tapping the backdrop. */
/** @action */
export function dismissPrompt(runtime: GameRuntime) {
  answerPrompt(runtime, { value: "modal-close", text: "" });
}
