import type {
  GenreStat,
  HeatmapDay,
  MonthlyStat,
  StatsSummary,
} from "@/types";
import { format, subDays } from "date-fns";

export const mockStatsSummary: StatsSummary = {
  year: 2026,
  finishedCount: 7,
  yearlyGoal: 24,
  goalProgressPercent: 29.2,
  averageRating: 4.1,
};

export const mockMonthlyStats: MonthlyStat[] = [
  { month: "1월", count: 2 },
  { month: "2월", count: 1 },
  { month: "3월", count: 0 },
  { month: "4월", count: 2 },
  { month: "5월", count: 2 },
  { month: "6월", count: 0 },
  { month: "7월", count: 0 },
  { month: "8월", count: 0 },
  { month: "9월", count: 0 },
  { month: "10월", count: 0 },
  { month: "11월", count: 0 },
  { month: "12월", count: 0 },
];

export const mockGenreStats: GenreStat[] = [
  { genre: "소설", count: 4, percent: 40 },
  { genre: "에세이", count: 2, percent: 20 },
  { genre: "자기계발", count: 2, percent: 20 },
  { genre: "기타", count: 2, percent: 20 },
];

function buildHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  for (let i = 364; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd");
    const seed = (i * 17) % 11;
    const count = seed < 3 ? 0 : seed < 6 ? 1 : seed < 9 ? 2 : 3;
    days.push({ date, count });
  }
  return days;
}

export const mockHeatmapDays = buildHeatmap();
