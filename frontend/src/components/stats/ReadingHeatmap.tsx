"use client";

import { format, startOfWeek, eachDayOfInterval, subDays } from "date-fns";
import { ko } from "date-fns/locale";
import type { HeatmapDay } from "@/types";

const LEVELS = [
  "bg-muted/40 border border-border/30",
  "bg-[#9be9a8] border border-transparent shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]",
  "bg-[#40c463] border border-transparent shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]",
  "bg-[#30a14e] border border-transparent shadow-[inset_0_1px_2px_rgba(255,255,255,0.3)]",
  "bg-[#216e39] border border-transparent shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]",
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
    <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
      <div
        className="inline-grid gap-[4px] p-2"
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
                  className="size-3 rounded-[3px] sm:size-3.5"
                />
              );
            }
            const key = format(day, "yyyy-MM-dd");
            const count = map.get(key) ?? 0;
            return (
              <div
                key={key}
                title={`${format(day, "yyyy-MM-dd", { locale: ko })}: ${count}회`}
                className={`size-3 rounded-[3px] sm:size-3.5 transition-all duration-300 hover:scale-125 hover:z-10 cursor-default ${LEVELS[level(count)]}`}
              />
            );
          }),
        )}
      </div>
      {!compact && (
        <div className="mt-4 flex items-center justify-end gap-1.5 text-[11px] font-semibold text-muted-foreground pr-2">
          <span>적음</span>
          {LEVELS.map((c, i) => (
            <div key={i} className={`size-3.5 rounded-[3px] ${c}`} />
          ))}
          <span>많음</span>
        </div>
      )}
    </div>
  );
}
