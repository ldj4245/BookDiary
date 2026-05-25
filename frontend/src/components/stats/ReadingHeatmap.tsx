"use client";

import { format, startOfWeek, eachDayOfInterval, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { HeatmapDay } from "@/types";

const LEVELS = [
  "bg-muted/60",
  "bg-[#dfe8d8]",
  "bg-[#bdcdb3]",
  "bg-[#81946f]",
  "bg-[#526a49]",
];

type Props = {
  days: HeatmapDay[];
  compact?: boolean;
};

export function ReadingHeatmap({ days, compact = false }: Props) {
  const map = new Map(days.map((d) => [d.date, d.count]));
  const end = new Date();
  const start = subDays(end, compact ? 84 : 364);
  const allDays = eachDayOfInterval({ start, end });
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];

  allDays.forEach((day) => {
    if (currentWeek.length === 0) {
      const pad = startOfWeek(day, { weekStartsOn: 0 }).getDay();
      for (let i = 0; i < pad; i++) currentWeek.push(new Date(0));
    }
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });
  if (currentWeek.length) weeks.push(currentWeek);

  function level(count: number) {
    if (count <= 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    return 4;
  }

  return (
    <div className="overflow-x-auto">
      <div
        className="inline-grid gap-[3px]"
        style={{
          gridTemplateColumns: `repeat(${weeks.length}, minmax(0, 1fr))`,
          gridTemplateRows: "repeat(7, minmax(0, 1fr))",
        }}
      >
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (day.getTime() === 0) {
              return (
                <div
                  key={`${wi}-${di}-empty`}
                  className="size-2.5 rounded-sm sm:size-3"
                />
              );
            }
            const key = format(day, "yyyy-MM-dd");
            const count = map.get(key) ?? 0;
            return (
              <div
                key={key}
                title={`${format(day, "yyyy-MM-dd", { locale: ko })}: ${count}회`}
                className={`size-2.5 rounded-sm sm:size-3 ${LEVELS[level(count)]}`}
              />
            );
          }),
        )}
      </div>
      {!compact && (
        <div className="mt-2 flex items-center justify-end gap-1 text-xs text-muted-foreground">
          <span>적음</span>
          {LEVELS.map((c, i) => (
            <div key={i} className={`size-3 rounded-sm ${c}`} />
          ))}
          <span>많음</span>
        </div>
      )}
    </div>
  );
}
