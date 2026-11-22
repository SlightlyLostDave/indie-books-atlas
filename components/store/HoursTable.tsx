"use client";

import { useSyncExternalStore } from "react";
import { dayKeyFor, formatWeekRows } from "@/lib/hours";
import type { DayKey, HoursParsed } from "@/lib/types";
import { cn } from "@/lib/utils";

interface HoursTableProps {
  hours: HoursParsed;
  /** Mark the visitor's current weekday. Off for a closed store. */
  markToday?: boolean;
  /** `ui` for the map sidebar, `body` for the store page. */
  size?: "ui" | "body";
  className?: string;
}

const noSubscribe = () => () => {};
const today = () => dayKeyFor(new Date());
// Store pages are static and can be up to a day old, so "today" is only
// known in the browser. The server render marks no day.
const serverToday = () => null;

/**
 * The week from `hours_parsed`, Monday to Sunday plus public holidays.
 * A day missing from the record reads "Not recorded" (unknown, not closed),
 * and today's row carries the current-row treatment: a moss leading rule,
 * the step tone and medium weight, plus the word "today".
 */
export default function HoursTable({ hours, markToday = true, size = "body", className }: HoursTableProps) {
  const todayKey: DayKey | null = useSyncExternalStore(noSubscribe, today, serverToday);
  const rows = formatWeekRows(hours);
  const anyUnknown = rows.some((r) => r.hours === null);

  return (
    <div className={className}>
      <table className={cn("w-full border-collapse", size === "ui" ? "text-ui" : "text-body")}>
        <caption className="sr-only">Opening hours</caption>
        <tbody>
          {rows.map((row) => {
            const isToday = markToday && row.key === todayKey;
            return (
              <tr
                key={row.key}
                aria-current={isToday ? "date" : undefined}
                className={cn(
                  row.key === "ph" && "border-t border-line",
                  isToday && "bg-bg-step",
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    "border-l-2 py-1 pr-4 pl-2.5 text-left align-baseline font-normal whitespace-nowrap",
                    row.key === "ph" && "pt-2",
                    isToday ? "border-moss font-medium text-ink" : "border-transparent text-ink-dim",
                  )}
                >
                  {row.label}
                </th>
                <td className={cn("w-full py-1 pr-2.5 align-baseline", row.key === "ph" && "pt-2")}>
                  {row.hours === null ? (
                    <span className="font-display text-ink-faint italic">Not recorded</span>
                  ) : (
                    <span className={cn("lining-nums tabular-nums", isToday ? "font-medium text-ink" : "text-ink")}>
                      {row.hours}
                    </span>
                  )}
                  {isToday && <span className="ml-2 font-display text-ink-dim italic">today</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {anyUnknown && (
        <p className="mt-2 pl-3 text-meta text-ink-faint">
          Days marked not recorded are unknown, not closed. Call ahead to be sure.
        </p>
      )}
    </div>
  );
}
