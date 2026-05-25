"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartColumn, Star, Target } from "lucide-react";
import { ReadingHeatmap } from "@/components/stats/ReadingHeatmap";
import { YearlyRing } from "@/components/stats/YearlyRing";
import {
  getGenreStats,
  getHeatmap,
  getMonthlyStats,
  getStatsSummary,
} from "@/lib/api/client";
import type { GenreStat, HeatmapDay, MonthlyStat, StatsSummary } from "@/types";

const CHART_COLORS = ["#657a5b", "#7c3f3b", "#b98542", "#78909c", "#55483a"];

export default function StatsPage() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [genres, setGenres] = useState<GenreStat[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);

  useEffect(() => {
    void Promise.all([
      getStatsSummary(),
      getMonthlyStats(),
      getGenreStats(),
      getHeatmap(),
    ]).then(([s, m, g, h]) => {
      setSummary(s);
      setMonthly(m);
      setGenres(g);
      setHeatmap(h);
    });
  }, []);

  return (
    <div className="space-y-7">
      <header className="border-b border-border/70 pb-6">
        <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-primary">
          <ChartColumn className="size-3.5" />
          독서 리듬
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--ink)]">
          통계
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          올해의 흐름과 취향
        </p>
      </header>

      {summary && (
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="rounded-lg border border-border/80 bg-card p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Target className="size-4 text-primary" />
              연간 목표
            </div>
            <YearlyRing
              year={summary.year}
              finishedCount={summary.finishedCount}
              yearlyGoal={summary.yearlyGoal}
              goalProgressPercent={summary.goalProgressPercent}
            />
          </div>

          <div className="rounded-lg border border-border/80 bg-[var(--paper)] p-5">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Star className="size-4 text-primary" />
              평균 별점
            </div>
            <p className="mt-6 text-4xl font-semibold text-[var(--ink)]">
              {summary.averageRating}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">5점 만점</p>
          </div>
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-border/80 bg-card p-5">
          <h2 className="mb-5 text-sm font-medium">월별 완독 권수</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "rgb(101 122 91 / 0.08)" }} />
                <Bar dataKey="count" fill="var(--sage)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card p-5">
          <h2 className="mb-5 text-sm font-medium">장르별 비율</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genres}
                  dataKey="count"
                  nameKey="genre"
                  cx="50%"
                  cy="50%"
                  outerRadius={86}
                  innerRadius={46}
                  paddingAngle={3}
                  label={(props) => {
                    const name = props.name as string;
                    const pct = ((props.percent ?? 0) * 100).toFixed(0);
                    return `${name} ${pct}%`;
                  }}
                >
                  {genres.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border/80 bg-card p-5">
        <h2 className="mb-5 text-sm font-medium">독서 활동</h2>
        <ReadingHeatmap days={heatmap} />
      </section>
    </div>
  );
}
