import type { GameClock } from "./types.js";

export function clockFromAbsoluteHour(absoluteHour: number): GameClock {
  return {
    year: 628,
    day: Math.floor(absoluteHour / 24) + 1,
    hour: absoluteHour % 24
  };
}

export function formatClock(clock: GameClock): string {
  const hour = String(clock.hour).padStart(2, "0");
  return `Day ${clock.day}, 628 CR · ${hour}:00`;
}
