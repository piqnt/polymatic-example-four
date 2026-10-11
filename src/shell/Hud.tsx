// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import { type ComponentChildren } from "preact";
import { type IconType } from "react-icons";
import { TbAlertTriangle, TbChevronsUp, TbCircleMinus, TbCircles, TbStar, TbTarget } from "react-icons/tb";
import { TiPlus } from "react-icons/ti";
import { FaRegCheckCircle } from "react-icons/fa";

import { type ProgressSlot } from "../model";
import { useGameRuntime } from "./context";
import { showProgress, showStats, toggleModeMenu } from "./actions";
import styles from "./Hud.module.css";

export function Hud() {
  return (
    <>
      <StatusPanel />
      <ProgressPanel />
      <Warning />
      <ModeControl />
    </>
  );
}

/**
 * A number and the icon that says what it counts. The sprite hud marked these
 * with glyphs of its own - ^ for the level, < for what had been cleared, > for
 * the score - and the atlas font is not something the DOM can draw, so the
 * icons stand in for them.
 */
function Stat({
  icon: Icon,
  label,
  muted,
  children,
}: {
  icon: IconType;
  label: string;
  muted?: boolean;
  children: ComponentChildren;
}) {
  return (
    <span class={`${styles.stat} ${muted ? styles.muted : ""}`} aria-label={label}>
      <Icon aria-hidden size="1em" />
      <span>{children}</span>
    </span>
  );
}

/** Level, what has been cleared, and how full the board is. Opens the stats modal. */
function StatusPanel() {
  const runtime = useGameRuntime();
  const { level, collected, score, load, maxVertices, loadVisible } = runtime.context.hud;

  return (
    <button type="button" class={`${styles.wrapper} ${styles.status}`} onClick={() => showStats(runtime)}>
      <span class={styles.statusLine}>
        <Stat icon={TbChevronsUp} label="Level">
          {level.value}
        </Stat>
        <Stat icon={TiPlus} label="Score">
          {score.value}
        </Stat>
        <Stat icon={FaRegCheckCircle} label="Cleared">
          {collected.value}
        </Stat>
      </span>
      {loadVisible.value && (
        <Stat icon={TbCircles} label="On board">
          {load.value}/{maxVertices.value}
        </Stat>
      )}
    </button>
  );
}

/** What is left of the mission, one bar per color. Opens the progress modal. */
function ProgressPanel() {
  const runtime = useGameRuntime();
  const { progress } = runtime.context.hud;

  return (
    <button type="button" class={`${styles.wrapper} ${styles.progress}`} onClick={() => showProgress(runtime)}>
      {progress.map((slot) => (
        <ProgressBar key={slot.key} slot={slot} />
      ))}
    </button>
  );
}

/**
 * One bar. It reads its own two signals, so a frame that only moves the red bar
 * re-renders only the red bar.
 */
function ProgressBar({ slot }: { slot: ProgressSlot }) {
  const width = slot.width.value;
  if (width <= 0) return null;

  return (
    <span class={styles.slot}>
      <span class={styles.bar} style={{ width: `${width}px`, background: slot.color }} />
      <span class={styles.slotText} style={{ color: slot.color }}>
        {slot.text.value}
      </span>
    </span>
  );
}

/** The sprite hud ended this count with a ! glyph; the icon is that warning. */
function Warning() {
  const { warningVisible, warningText } = useGameRuntime().context.hud;
  if (!warningVisible.value) return null;
  return (
    <div class={styles.warning} aria-label="Room left on the board">
      <TbAlertTriangle aria-hidden size="0.8em" />
      <span>{warningText.value}</span>
    </div>
  );
}

/** The mode button. Pressing it opens the mode chooser (see shell/ModeModal). */
function ModeControl() {
  const runtime = useGameRuntime();
  const { mode, modeMenuOpen } = runtime.context;
  const current = mode.value;
  if (!current) return null;

  return (
    <button
      type="button"
      class={`${styles.badge} ${styles.modeControl}`}
      aria-label={`Mode: ${current.name ?? current.key}`}
      aria-haspopup="dialog"
      aria-expanded={modeMenuOpen.value}
      onClick={() => toggleModeMenu(runtime)}
    >
      <TbTarget aria-hidden size="1em" />
    </button>
  );
}
