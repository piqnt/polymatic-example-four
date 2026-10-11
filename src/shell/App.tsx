// Copyright (c) Ali Shakiba
// Licensed under the MIT License

import "./fonts.css";

import { GameContext } from "./context";
import { runtime } from "../async-signals";
import { Hud } from "./Hud";
import { ModeModal } from "./ModeModal";
import { PromptModal } from "./PromptModal";

/**
 * The shell. It mounts before the runtime exists (see index.tsx), so every read
 * below is guarded: `runtime` fills in once the game has been activated, and
 * `ready` once its assets are loaded and a mode is playing.
 */
export function App() {
  const context = runtime.value?.context;
  const ready = context?.ready.value;
  const prompt = context?.prompt.value;
  const modeMenu = context?.modeMenuOpen.value;

  return (
    <GameContext.Provider value={runtime.value ?? null}>
      {runtime.value && ready && <Hud />}
      {runtime.value && modeMenu && <ModeModal />}
      {runtime.value && prompt && <PromptModal config={prompt} />}
    </GameContext.Provider>
  );
}
