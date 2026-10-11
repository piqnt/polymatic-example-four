// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { PlayableModes, type PlayMode } from "../model";
import { useGameRuntime } from "./context";
import { closeModeMenu, selectMode } from "./actions";
import styles from "./ModeModal.module.css";

/**
 * The mode chooser, opened by the badge in the corner of the board. Picking a
 * different mode switches to it; picking the one already playing offers to
 * restart it, which is why this closes itself and the prompt takes over (see
 * selectMode in actions).
 */
export function ModeModal() {
  const runtime = useGameRuntime();
  const current = runtime.context.mode.value;

  return (
    <div class={styles.backdrop} onClick={() => closeModeMenu(runtime)}>
      <div
        class={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Mode"
        onClick={(ev) => ev.stopPropagation()}
      >
        <div class={styles.title}>Mode</div>
        <div class={styles.modes}>
          {PlayableModes.map((mode) => (
            <ModeOption key={mode.key} mode={mode} current={mode === current} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeOption({ mode, current }: { mode: PlayMode; current: boolean }) {
  const runtime = useGameRuntime();

  return (
    <button
      type="button"
      class={`${styles.mode} ${current ? styles.current : ""}`}
      aria-current={current}
      onClick={() => selectMode(runtime, mode)}
    >
      {mode.name ?? mode.key}
    </button>
  );
}
