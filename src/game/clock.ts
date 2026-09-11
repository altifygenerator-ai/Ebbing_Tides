import type { GameClock } from "./types.js";
import { dayOfYear, worldDateFromAbsoluteHour, formatWorldDate } from "./time/calendar.js";

export function clockFromAbsoluteHour(absoluteHour: number): GameClock {
  return worldDateFromAbsoluteHour(absoluteHour);
}

/** Preserve Alpha surface readability while the canonical month names remain data-driven/unfinalized. */
export function formatClock(clock: GameClock): string {
  const hour = String(clock.hour).padStart(2, "0");
  return `Day ${dayOfYear(clock)}, ${clock.year} CR · ${hour}:00`;
}

export function formatCanonicalClock(clock: GameClock): string {
  return formatWorldDate(clock);
}
