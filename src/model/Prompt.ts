// Copyright (c) Ali Shakiba
// Licensed under the MIT License

/**
 * A modal the shell renders. The runtime never builds DOM for it: it puts a
 * config on `context.prompt` (or the shell does, via shell/actions), the shell
 * draws it, and whichever action the player picks comes back to the runtime as
 * a "modal-action" event.
 */
export interface PromptAction {
  value: string;
  text: string;
}

export interface PromptConfig {
  message: string;
  actions: PromptAction[];
}
