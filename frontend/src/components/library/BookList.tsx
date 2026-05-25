import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { statusColors, statusLabels } from "@/lib/labels";
import type { UserBook } from "@/types";

type Props = {
  books: UserBook[];
};

export function BookList({ books }: Props) {
  if (books.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/40 bg-card/60 backdrop-blur-xl px-4 py-16 text-center text-sm font-medium text-muted-foreground shadow-sm">
        서재가 비어 있습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-border/30 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl shadow-lg shadow-primary/5 overflow-hidden">
      {books.map((ub) => (
        <li key={ub.id}>
          <Link
            href={`/books/${ub.id}`}
            className="group grid gap-4 p-5 transition-all duration-300 hover:bg-muted/50 hover:px-6 sm:grid-cols-[64px_minmax(0,1fr)_160px]"
          >
            <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted/40 shadow-sm border border-border/40 group-hover:shadow-md transition-shadow">
              {ub.book.coverUrl && (
                <Image
                  src={ub.book.coverUrl}
                  alt=""
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-foreground group-hover:text-primary transition-colors text-base">{ub.book.title}</p>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">{ub.book.author}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className={statusColors[ub.status]}>
                  {statusLabels[ub.status]}
                </Badge>
                {ub.rating != null && (
                  <span className="text-xs text-muted-foreground">
                    ★ {ub.rating}
                  </span>
                )}
              </div>
            </div>
            <div className="self-center">
              {ub.status === "READING" ? (
                <div>
                  <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                    <span>{ub.currentPage}쪽</span>
                    <span>{ub.progressPercent}%</span>
                  </div>
                  <Progress value={ub.progressPercent} className="h-1.5" />
                </div>
              ) : (
                <p className="text-xs font-medium text-muted-foreground sm:text-right">
                  {ub.finishedAt ?? ub.startedAt ?? "날짜 없음"}
                </p>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
