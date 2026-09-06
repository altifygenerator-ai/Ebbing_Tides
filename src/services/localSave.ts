import type { GameState } from "../game/types.js";

const KEY = "ebbing-tides.alpha-0.1.save";

export function saveLocal(state: GameState): void {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function loadLocal(): GameState | undefined {
  const raw = localStorage.getItem(KEY);
  if (!raw) return undefined;
  const parsed = JSON.parse(raw) as GameState;
  if (parsed.schemaVersion !== 1) throw new Error("Unsupported save schema version.");
  return parsed;
}

export function clearLocalSave(): void {
  localStorage.removeItem(KEY);
}

export function hasLocalSave(): boolean {
  return Boolean(localStorage.getItem(KEY));
}
