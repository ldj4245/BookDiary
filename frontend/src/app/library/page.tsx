"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, List, LibraryBig } from "lucide-react";
import { BookGrid } from "@/components/library/BookGrid";
import { BookList } from "@/components/library/BookList";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { listUserBooks } from "@/lib/api/client";
import { statusLabels } from "@/lib/labels";
import type { ReadingStatus, UserBook } from "@/types";

const statusOrder: Array<ReadingStatus | "ALL"> = [
  "ALL",
  "READING",
  "WANT_TO_READ",
  "FINISHED",
  "DNF",
];

const sortLabels = {
  recent: "최근 기록",
  rating: "별점 높은순",
  title: "제목순",
} as const;

export default function LibraryPage() {
  const [books, setBooks] = useState<UserBook[]>([]);
  const [allBooks, setAllBooks] = useState<UserBook[]>([]);
  const [status, setStatus] = useState<ReadingStatus | "ALL">("ALL");
  const [sort, setSort] = useState<"recent" | "rating" | "title">("recent");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    void Promise.all([
      listUserBooks({ sort }),
      listUserBooks({
        status: status === "ALL" ? undefined : status,
        sort,
      }),
    ]).then(([all, filtered]) => {
      setAllBooks(all);
      setBooks(filtered);
    });
  }, [status, sort]);

  const counts = useMemo(() => {
    const map: Record<ReadingStatus | "ALL", number> = {
      ALL: allBooks.length,
      WANT_TO_READ: 0,
      READING: 0,
      FINISHED: 0,
      DNF: 0,
    };
    allBooks.forEach((book) => {
      map[book.status] += 1;
    });
    return map;
  }, [allBooks]);

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-4 border-b border-border/40 pb-6 md:flex-row md:items-end md:justify-between animate-fade-slide-up">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
            <LibraryBig className="size-4" />
            서재
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            내 서재
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {allBooks.length}권의 기록
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setView("grid")}
            aria-label="그리드 보기"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setView("list")}
            aria-label="리스트 보기"
          >
            <List className="size-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-4 shadow-lg shadow-primary/5 md:flex-row md:items-center md:justify-between animate-fade-slide-up delay-100">
        <Tabs
          value={status}
          onValueChange={(v) => v && setStatus(v as ReadingStatus | "ALL")}
        >
          <TabsList className="flex-wrap justify-start">
            {statusOrder.map((s) => (
              <TabsTrigger key={s} value={s} className="gap-1.5">
                {s === "ALL" ? "전체" : statusLabels[s]}
                <span className="text-[11px] font-semibold text-muted-foreground ml-1">
                  {counts[s]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Select
          value={sort}
          onValueChange={(v) => v && setSort(v as typeof sort)}
        >
          <SelectTrigger className="w-full bg-card md:w-[136px]">
            <span className="truncate">{sortLabels[sort]}</span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">최근 기록</SelectItem>
            <SelectItem value="rating">별점 높은순</SelectItem>
            <SelectItem value="title">제목순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="animate-fade-slide-up delay-200">
        {view === "grid" ? <BookGrid books={books} /> : <BookList books={books} />}
      </div>
    </div>
  );
}
