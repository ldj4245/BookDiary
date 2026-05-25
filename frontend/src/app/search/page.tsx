"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BookPlus, Compass, Search } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { createUserBook, searchBooks } from "@/lib/api/client";
import type { BookSearchResult } from "@/types";

const searchTypeLabels = {
  title: "제목",
  author: "저자",
  isbn: "ISBN",
} as const;

const sourceLabels: Record<BookSearchResult["source"], string> = {
  kakao: "카카오",
  manual: "도서 DB",
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("title");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.warning("검색어를 입력해주세요.");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const data = await searchBooks(query, type);
      setResults(data);
    } catch (error) {
      toast.error("검색 중 문제가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (book: BookSearchResult) => {
    try {
      const ub = await createUserBook({
        bookId: book.source === "manual" ? book.id : undefined,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          coverUrl: book.coverUrl,
          pageCount: book.pageCount,
          publisher: book.publisher,
        },
        status: "WANT_TO_READ",
      });
      toast.success("서재에 책을 담았습니다!");
      router.push(`/books/${ub.id}`);
    } catch (error) {
      toast.error("서재에 담지 못했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <header className="border-b border-border/40 pb-6 animate-fade-slide-up">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <Compass className="size-4" />
          발견
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          새 책 찾기
        </h1>
        <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-muted-foreground">
          읽고 싶은 책을 검색하여 서재에 조용히 꽂아둡니다.
        </p>
      </header>

      <section className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-4 md:p-5 shadow-lg shadow-primary/5 animate-fade-slide-up delay-100">
        <div className="grid gap-3 md:grid-cols-[140px_minmax(0,1fr)_auto]">
          <Select value={type} onValueChange={(v) => v && setType(v)}>
            <SelectTrigger className="w-full bg-background/50 border-border/50 h-11 rounded-xl shadow-sm focus:ring-primary/20">
              <span className="truncate font-medium text-foreground">
                {searchTypeLabels[type as keyof typeof searchTypeLabels]}
              </span>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/50">
              <SelectItem value="title" className="rounded-lg">제목</SelectItem>
              <SelectItem value="author" className="rounded-lg">저자</SelectItem>
              <SelectItem value="isbn" className="rounded-lg">ISBN</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="책 제목, 저자, ISBN 검색..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleSearch()}
            className="bg-background/50 border-border/50 h-11 rounded-xl shadow-sm text-[15px] font-medium focus-visible:ring-primary/20"
          />
          <Button onClick={() => void handleSearch()} disabled={loading} className="gap-2 h-11 rounded-xl px-6 font-bold shadow-sm transition-transform active:scale-95">
            <Search className="size-4" />
            {loading ? "검색 중..." : "도서 검색"}
          </Button>
        </div>
      </section>

      <section className="animate-fade-slide-up delay-200">
        {results.length > 0 ? (
          <ul className="grid gap-5 lg:grid-cols-2">
            {results.map((book) => (
              <li key={book.id}>
                <article className="group grid h-full grid-cols-[80px_minmax(0,1fr)] gap-5 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm p-5 shadow-md shadow-primary/5 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 hover:border-primary/20">
                  <div className="relative h-[116px] w-[80px] overflow-hidden rounded-lg bg-muted/40 shadow-sm border border-border/40 transition-transform group-hover:scale-105">
                    {book.coverUrl ? (
                      <Image
                        src={book.coverUrl}
                        alt={book.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs font-medium text-muted-foreground bg-gradient-to-br from-primary/5 to-muted">
                        표지 없음
                      </div>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col justify-between py-1">
                    <div className="min-w-0 flex-1">
                      <Badge variant="outline" className="mb-2.5 border-primary/20 bg-primary/5 text-primary rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                        {sourceLabels[book.source]}
                      </Badge>
                      <h2 className="line-clamp-2 text-base font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                        {book.title}
                      </h2>
                      <p className="mt-1.5 truncate text-sm font-medium text-muted-foreground">
                        {book.author}
                        {book.publisher && ` · ${book.publisher}`}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="mt-4 w-fit gap-2 h-9 rounded-lg font-bold shadow-sm"
                      onClick={() => void handleAdd(book)}
                    >
                      <BookPlus className="size-4" />
                      서재에 담기
                    </Button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/40 bg-card/60 backdrop-blur-xl px-4 py-20 text-center shadow-sm">
            <Search className="mx-auto size-8 text-muted-foreground/50 mb-4" />
            <p className="text-sm font-medium text-muted-foreground">
              {searched ? "검색 결과가 없습니다. 다른 키워드로 시도해보세요." : "검색어를 입력하고 새로운 책을 발견해보세요."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
