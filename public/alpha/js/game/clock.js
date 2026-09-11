import { dayOfYear, worldDateFromAbsoluteHour, formatWorldDate } from "./time/calendar.js";
export function clockFromAbsoluteHour(absoluteHour) {
    return worldDateFromAbsoluteHour(absoluteHour);
}
/** Preserve Alpha surface readability while the canonical month names remain data-driven/unfinalized. */
export function formatClock(clock) {
    const hour = String(clock.hour).padStart(2, "0");
    return `Day ${dayOfYear(clock)}, ${clock.year} CR · ${hour}:00`;
}
export function formatCanonicalClock(clock) {
    return formatWorldDate(clock);
}
//# sourceMappingURL=clock.js.map