"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  BarChart2,
  LibraryBig,
  NotebookPen,
  Target,
} from "lucide-react";
import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ReadingHeatmap } from "@/components/stats/ReadingHeatmap";
import { YearlyRing } from "@/components/stats/YearlyRing";
import {
  getHeatmap,
  getMonthlyStats,
  getStatsSummary,
  listPageNotes,
  listUserBooks,
} from "@/lib/api/client";
import { useLoggedIn } from "@/lib/use-auth";
import { statusColors, statusLabels } from "@/lib/labels";
import type {
  HeatmapDay,
  MonthlyStat,
  PageNote,
  StatsSummary,
  UserBook,
} from "@/types";

export default function HomePage() {
  const loggedIn = useLoggedIn();
  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) {
      router.push("/login");
    }
  }, [loggedIn, router]);

  if (!loggedIn) return null;

  return <TodayDashboard />;
}

function TodayDashboard() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [monthly, setMonthly] = useState<MonthlyStat[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapDay[]>([]);
  const [books, setBooks] = useState<UserBook[]>([]);
  const [recentNotes, setRecentNotes] = useState<PageNote[]>([]);

  useEffect(() => {
    void Promise.all([
      getStatsSummary(),
      getMonthlyStats(),
      getHeatmap(),
      listUserBooks({ sort: "recent" }),
    ]).then(async ([statsSummary, monthlyStats, heatmapDays, userBooks]) => {
      setSummary(statsSummary);
      setMonthly(monthlyStats);
      setHeatmap(heatmapDays);
      setBooks(userBooks);
      const current =
        userBooks.find((book) => book.status === "READING") ?? userBooks[0];
      if (current) {
        setRecentNotes((await listPageNotes(current.id)).slice(0, 3));
      }
    });
  }, []);

  const currentBook = useMemo(
    () => books.find((book) => book.status === "READING") ?? books[0],
    [books],
  );
  const waitingBooks = books
    .filter((book) => book.status === "WANT_TO_READ")
    .slice(0, 3);
  const finishedBooks = books.filter((book) => book.status === "FINISHED");

  return (
    <div className="space-y-10 pb-10">
      <header className="flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-end md:justify-between animate-fade-slide-up">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2">오늘</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            오늘의 독서
          </h1>
          <p className="mt-2 text-sm text-muted-foreground font-medium">
            다시 펼칠 책과 남겨둔 생각을 한곳에 모았습니다.
          </p>
        </div>
        <Link
          href="/search"
          className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-[0.98]"
        >
          <BookOpenCheck className="size-4" />
          새 책 찾기
        </Link>
      </header>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <div className="overflow-hidden rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 animate-fade-slide-up delay-100">
          {currentBook ? (
            <div className="grid h-full gap-0 md:grid-cols-[220px_minmax(0,1fr)]">
              <Link
                href={`/books/${currentBook.id}`}
                className="relative block min-h-[320px] bg-muted/30 md:min-h-full border-r border-border/40"
              >
                {currentBook.book.coverUrl ? (
                  <Image
                    src={currentBook.book.coverUrl}
                    alt={currentBook.book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 220px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center text-sm font-medium text-muted-foreground bg-gradient-to-br from-primary/5 to-muted">
                    표지 없음
                  </div>
                )}
              </Link>
              <div className="flex flex-col justify-between gap-8 p-6 md:p-8">
                <div>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-transparent px-3 py-1 text-xs font-semibold rounded-full"
                  >
                    {statusLabels[currentBook.status]}
                  </Badge>
                  <h2 className="mt-5 max-w-2xl text-2xl font-bold leading-tight text-foreground line-clamp-2">
                    {currentBook.book.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-muted-foreground">
                    {currentBook.book.author}
                    {currentBook.book.publisher &&
                      ` · ${currentBook.book.publisher}`}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">진행</span>
                      <span className="text-foreground">
                        {currentBook.currentPage} / {currentBook.totalPages}쪽
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-muted/60">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${currentBook.progressPercent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-muted-foreground">
                      {Math.round(currentBook.progressPercent)}% 읽음
                    </p>
                  </div>

                  {currentBook.oneLiner && (
                    <blockquote className="border-l-[3px] border-primary/40 pl-4 py-1 text-sm leading-relaxed text-foreground/90 italic font-medium">
                      "{currentBook.oneLiner}"
                    </blockquote>
                  )}

                  <Link
                    href={`/books/${currentBook.id}`}
                    className="inline-flex h-10 w-fit items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 px-4 text-sm font-semibold transition-all hover:bg-muted hover:border-border shadow-sm"
                  >
                    기록 열기
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center p-12 text-sm font-medium text-muted-foreground">
              아직 읽는 책이 없습니다.
            </div>
          )}
        </div>

        <div className="grid gap-6 animate-fade-slide-up delay-200">
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5">
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Target className="size-4" />
              </div>
              올해 목표
            </div>
            {summary && (
              <div className="mt-6 flex justify-center">
                <YearlyRing
                  year={summary.year}
                  finishedCount={summary.finishedCount}
                  yearlyGoal={summary.yearlyGoal}
                  goalProgressPercent={summary.goalProgressPercent}
                  compact
                />
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5 flex-1">
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <NotebookPen className="size-4" />
              </div>
              최근 메모
            </div>
            <div className="mt-5 space-y-3">
              {recentNotes.length > 0 ? (
                recentNotes.map((note) => (
                  <p
                    key={note.id}
                    className="rounded-xl bg-muted/40 border border-border/30 px-4 py-3 text-sm leading-relaxed text-foreground/90 font-medium"
                  >
                    <span className="mr-2 text-xs font-bold text-primary">
                      p.{note.pageNumber}
                    </span>
                    {note.content}
                  </p>
                ))
              ) : (
                <p className="text-sm font-medium text-muted-foreground">
                  남겨진 메모가 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] animate-fade-slide-up delay-300">
        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarDays className="size-4" />
              </div>
              독서 리듬
            </div>
            <Link
              href="/stats"
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              통계 보기
            </Link>
          </div>
          <ReadingHeatmap days={heatmap} compact />
        </div>

        <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LibraryBig className="size-4" />
              </div>
              다음 책
            </h2>
            <Link
              href="/library"
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              서재 보기
            </Link>
          </div>
          <div className="space-y-3">
            {waitingBooks.length > 0 ? (
              waitingBooks.map((book) => (
                <Link
                  key={book.id}
                  href={`/books/${book.id}`}
                  className="flex items-center gap-4 rounded-xl border border-transparent p-2 transition-all hover:bg-muted/50 hover:border-border/50"
                >
                  <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted shadow-sm border border-border/30">
                    {book.book.coverUrl && (
                      <Image
                        src={book.book.coverUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                  </div>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {book.book.title}
                    </span>
                    <span className="block truncate text-xs font-medium text-muted-foreground mt-0.5">
                      {book.book.author}
                    </span>
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                기다리는 책이 없습니다.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5 animate-fade-slide-up delay-400">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BarChart2 className="size-4" />
            </div>
            월별 완독 현황
          </h2>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
            올해 총 {finishedBooks.length}권
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4 font-medium">월별로 완독한 책의 권수를 확인합니다.</p>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 22, right: 4, left: -20, bottom: 0 }} barCategoryGap="35%">
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--muted-foreground)", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--primary)", opacity: 0.06, radius: 6 }}
                contentStyle={{
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
                formatter={(value: any) => [`${value}권`, '완독']}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[8, 8, 0, 0]} opacity={0.85}>
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={(val: any) => Number(val) > 0 ? `${val}권` : ""}
                  style={{ fontSize: '11px', fontWeight: 700, fill: 'var(--foreground)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
