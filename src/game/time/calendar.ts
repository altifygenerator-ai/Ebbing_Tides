import type { HistoricalDate } from "../../types/history.js";

export interface WorldDate {
  year: number;
  month: number;
  day: number;
  hour: number;
}

export interface CalendarDefinition {
  id: string;
  eraLabel: string;
  monthsPerYear: number;
  monthLengths: number[];
  /** Empty until canonical month names are approved. Numeric month display remains authoritative in 0.6A. */
  monthNames: string[];
}

export const COMMON_RECKONING_CALENDAR: CalendarDefinition = {
  id: "calendar.common_reckoning.0.6A",
  eraLabel: "CR",
  monthsPerYear: 12,
  // Engine-normalization constants for 0.6A. Month names/unequal lengths remain data, not hard-coded UI rules.
  monthLengths: Array.from({ length: 12 }, () => 30),
  monthNames: []
};

export const CAMPAIGN_START_DATE: WorldDate = { year: 628, month: 1, day: 1, hour: 0 };

export function daysInYear(calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): number {
  return calendar.monthLengths.reduce((sum, value) => sum + value, 0);
}

export function validateWorldDate(date: WorldDate, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): string[] {
  const errors: string[] = [];
  if (!Number.isInteger(date.year)) errors.push("WorldDate year must be an integer.");
  if (!Number.isInteger(date.month) || date.month < 1 || date.month > calendar.monthsPerYear) errors.push("WorldDate month is out of range.");
  const monthLength = calendar.monthLengths[date.month - 1];
  if (!Number.isInteger(date.day) || date.day < 1 || monthLength === undefined || date.day > monthLength) errors.push("WorldDate day is out of range.");
  if (!Number.isInteger(date.hour) || date.hour < 0 || date.hour > 23) errors.push("WorldDate hour is out of range.");
  return errors;
}

export function absoluteHourFromWorldDate(date: WorldDate, epoch: WorldDate = CAMPAIGN_START_DATE, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): number {
  const dateErrors = validateWorldDate(date, calendar);
  const epochErrors = validateWorldDate(epoch, calendar);
  if (dateErrors.length || epochErrors.length) throw new Error([...dateErrors, ...epochErrors].join(" "));
  const yearHours = daysInYear(calendar) * 24;
  const toDayOffset = (value: WorldDate) => {
    const priorMonths = calendar.monthLengths.slice(0, value.month - 1).reduce((sum, length) => sum + length, 0);
    return priorMonths + (value.day - 1);
  };
  return (date.year - epoch.year) * yearHours + (toDayOffset(date) - toDayOffset(epoch)) * 24 + (date.hour - epoch.hour);
}

export function worldDateFromAbsoluteHour(absoluteHour: number, epoch: WorldDate = CAMPAIGN_START_DATE, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): WorldDate {
  if (!Number.isFinite(absoluteHour)) throw new Error("absoluteHour must be finite.");
  const wholeHours = Math.floor(absoluteHour);
  const yearDays = daysInYear(calendar);
  const epochDay = calendar.monthLengths.slice(0, epoch.month - 1).reduce((sum, length) => sum + length, 0) + (epoch.day - 1);
  const epochHourInYear = epochDay * 24 + epoch.hour;
  const totalHourIndex = epochHourInYear + wholeHours;
  const yearOffset = Math.floor(totalHourIndex / (yearDays * 24));
  let hourInYear = ((totalHourIndex % (yearDays * 24)) + yearDays * 24) % (yearDays * 24);
  const dayIndex = Math.floor(hourInYear / 24);
  const hour = hourInYear % 24;
  let remainingDay = dayIndex;
  let month = 1;
  for (const length of calendar.monthLengths) {
    if (remainingDay < length) break;
    remainingDay -= length;
    month += 1;
  }
  return { year: epoch.year + yearOffset, month, day: remainingDay + 1, hour };
}

export function addHours(date: WorldDate, hours: number, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): WorldDate {
  const relative = absoluteHourFromWorldDate(date, CAMPAIGN_START_DATE, calendar);
  return worldDateFromAbsoluteHour(relative + Math.floor(hours), CAMPAIGN_START_DATE, calendar);
}

export function compareWorldDates(a: WorldDate, b: WorldDate): number {
  return Math.sign(absoluteHourFromWorldDate(a) - absoluteHourFromWorldDate(b));
}

export function dayOfYear(date: WorldDate, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): number {
  return calendar.monthLengths.slice(0, date.month - 1).reduce((sum, length) => sum + length, 0) + date.day;
}

export function historicalDateFromWorldDate(date: WorldDate): HistoricalDate {
  return { precision: "exact", year: date.year, month: date.month, day: date.day, hour: date.hour };
}

export function formatWorldDate(date: WorldDate, options: { includeHour?: boolean; calendar?: CalendarDefinition } = {}): string {
  const calendar = options.calendar ?? COMMON_RECKONING_CALENDAR;
  const monthName = calendar.monthNames[date.month - 1];
  const monthText = monthName ? `${date.day} ${monthName}` : `${date.year.toString().padStart(1, "0")}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  const core = monthName ? `${monthText}, ${date.year} ${calendar.eraLabel}` : `${monthText} ${calendar.eraLabel}`;
  return options.includeHour === false ? core : `${core} · ${String(date.hour).padStart(2, "0")}:00`;
}

export function formatHistoricalDate(date: HistoricalDate, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): string {
  switch (date.precision) {
    case "unknown": return "Date unknown";
    case "range": return date.year !== undefined && date.endYear !== undefined ? `${date.year}–${date.endYear} ${calendar.eraLabel}` : "Date range unknown";
    case "approximate": return date.year !== undefined ? `c. ${date.year} ${calendar.eraLabel}` : "Approximate date unknown";
    case "year": return date.year !== undefined ? `${date.year} ${calendar.eraLabel}` : "Year unknown";
    case "month": {
      if (date.year === undefined || date.month === undefined) return "Month unknown";
      const name = calendar.monthNames[date.month - 1];
      return name ? `${name}, ${date.year} ${calendar.eraLabel}` : `${date.year}-${String(date.month).padStart(2, "0")} ${calendar.eraLabel}`;
    }
    case "exact": {
      if (date.year === undefined || date.month === undefined || date.day === undefined) return "Exact date incomplete";
      return formatWorldDate({ year: date.year, month: date.month, day: date.day, hour: date.hour ?? 0 }, { includeHour: date.hour !== undefined, calendar });
    }
  }
}

export function validateHistoricalDate(date: HistoricalDate, calendar: CalendarDefinition = COMMON_RECKONING_CALENDAR): string[] {
  const errors: string[] = [];
  const needsYear = date.precision !== "unknown";
  if (needsYear && date.year === undefined) errors.push("Historical date precision requires a year.");
  if (date.precision === "month" && date.month === undefined) errors.push("Month-precision historical date requires month.");
  if (date.precision === "exact" && (date.month === undefined || date.day === undefined)) errors.push("Exact historical date requires month and day.");
  if (date.precision === "range" && date.endYear === undefined) errors.push("Range historical date requires endYear.");
  if (date.year !== undefined && date.endYear !== undefined && date.endYear < date.year) errors.push("Historical date range ends before it begins.");
  if (date.month !== undefined && (date.month < 1 || date.month > calendar.monthsPerYear)) errors.push("Historical date month is out of range.");
  if (date.day !== undefined && date.month !== undefined) {
    const max = calendar.monthLengths[date.month - 1];
    if (date.day < 1 || max === undefined || date.day > max) errors.push("Historical date day is out of range.");
  }
  if (date.hour !== undefined && (date.hour < 0 || date.hour > 23)) errors.push("Historical date hour is out of range.");
  return errors;
}

/** Sort key for chronology checks. Unknown dates return undefined rather than pretending precision. */
export function historicalDateSortKey(date: HistoricalDate): number | undefined {
  if (date.year === undefined) return undefined;
  const month = date.month ?? (date.precision === "range" ? 1 : 1);
  const day = date.day ?? 1;
  const hour = date.hour ?? 0;
  try { return absoluteHourFromWorldDate({ year: date.year, month, day, hour }); }
  catch { return undefined; }
}
