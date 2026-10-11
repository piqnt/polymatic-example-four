// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type PromptConfig } from "../model";
import { useGameRuntime } from "./context";
import { answerPrompt, dismissPrompt } from "./actions";
import styles from "./PromptModal.module.css";

/**
 * The modal the runtime used to draw on the stage. It is told what to show by
 * `context.prompt`, and every answer goes back as a "modal-action" event.
 */
export function PromptModal({ config }: { config: PromptConfig }) {
  const runtime = useGameRuntime();

  return (
    <div class={styles.backdrop} onClick={() => dismissPrompt(runtime)}>
      <div class={styles.panel} role="dialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
        <div class={styles.message}>
          {config.message.split("\n").map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
        <div class={styles.actions}>
          {config.actions.map((action) => (
            <button type="button" key={action.value} class={styles.action} onClick={() => answerPrompt(runtime, action)}>
              {action.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
