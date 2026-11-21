import type { DayHours, DayKey, HoursParsed } from "@/lib/types";

const WEEK: Exclude<DayKey, "ph">[] = ["mo", "tu", "we", "th", "fr", "sa", "su"];

const DAY_SHORT: Record<DayKey, string> = {
  mo: "Mon",
  tu: "Tue",
  we: "Wed",
  th: "Thu",
  fr: "Fri",
  sa: "Sat",
  su: "Sun",
  ph: "Holidays",
};

// schema.org `openingHours` uses the same two-letter codes as OSM.
const DAY_SCHEMA: Record<Exclude<DayKey, "ph">, string> = {
  mo: "Mo",
  tu: "Tu",
  we: "We",
  th: "Th",
  fr: "Fr",
  sa: "Sa",
  su: "Su",
};

export interface HoursRow {
  days: string;
  hours: string;
}

function isOpen(day: DayHours): day is DayHours & { open: string; close: string } {
  return !day.closed && Boolean(day.open) && Boolean(day.close);
}

/** "09:30" → "9:30 am", "18:00" → "6 pm", "12:00" → "noon". */
function formatTime(value: string): string {
  const [h, m = "00"] = value.split(":");
  const hour = Number(h);
  if (Number.isNaN(hour)) return value;
  if (hour === 12 && m === "00") return "noon";
  if ((hour === 0 || hour === 24) && m === "00") return "midnight";
  const suffix = hour >= 12 && hour < 24 ? "pm" : "am";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return m === "00" ? `${hour12} ${suffix}` : `${hour12}:${m} ${suffix}`;
}

function describeDay(day: DayHours): string | null {
  if (day.closed) return "Closed";
  if (!isOpen(day)) return null;
  if (day.open === "00:00" && (day.close === "23:59" || day.close === "24:00")) {
    return "Open 24 hours";
  }
  return `${formatTime(day.open)} – ${formatTime(day.close)}`;
}

/** Group consecutive weekdays with identical values into runs. */
function groupRuns<T>(
  hours: HoursParsed,
  describe: (day: DayHours) => T | null,
): { start: Exclude<DayKey, "ph">; end: Exclude<DayKey, "ph">; value: T }[] {
  const runs: { start: Exclude<DayKey, "ph">; end: Exclude<DayKey, "ph">; value: T }[] = [];
  let previousKey: string | null = null;

  for (const key of WEEK) {
    const day = hours[key];
    const value = day ? describe(day) : null;
    if (value === null) {
      previousKey = null;
      continue;
    }
    const valueKey = JSON.stringify(value);
    const last = runs[runs.length - 1];
    if (last && previousKey === valueKey) {
      last.end = key;
    } else {
      runs.push({ start: key, end: key, value });
    }
    previousKey = valueKey;
  }

  return runs;
}

/**
 * Display rows for the store page, e.g. `{ days: "Mon – Fri", hours: "10 am – 6 pm" }`.
 * Days missing from `hours_parsed` are unknown and are omitted.
 */
export function formatHoursRows(hours: HoursParsed | null): HoursRow[] {
  if (!hours) return [];

  const rows: HoursRow[] = groupRuns(hours, describeDay).map(({ start, end, value }) => ({
    days: start === end ? DAY_SHORT[start] : `${DAY_SHORT[start]} – ${DAY_SHORT[end]}`,
    hours: value,
  }));

  const holidays = hours.ph ? describeDay(hours.ph) : null;
  if (holidays) rows.push({ days: DAY_SHORT.ph, hours: holidays });

  return rows;
}

/** schema.org `openingHours` strings, e.g. `["Mo-Fr 10:00-18:00", "Sa 10:00-16:00"]`. */
export function toSchemaOpeningHours(hours: HoursParsed | null): string[] {
  if (!hours) return [];

  return groupRuns(hours, (day) => (isOpen(day) ? `${day.open}-${day.close}` : null)).map(
    ({ start, end, value }) =>
      `${start === end ? DAY_SCHEMA[start] : `${DAY_SCHEMA[start]}-${DAY_SCHEMA[end]}`} ${value}`,
  );
}
