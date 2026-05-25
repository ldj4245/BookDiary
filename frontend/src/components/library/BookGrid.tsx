import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "@/lib/labels";
import type { UserBook } from "@/types";

type Props = {
  books: UserBook[];
};

export function BookGrid({ books }: Props) {
  if (books.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/40 bg-card/60 backdrop-blur-xl px-4 py-16 text-center text-sm font-medium text-muted-foreground shadow-sm">
        서재가 비어 있습니다. 검색에서 책을 추가해 보세요.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((ub) => (
        <Link
          key={ub.id}
          href={`/books/${ub.id}`}
          className="group"
        >
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl bg-muted/40 shadow-md shadow-primary/5 border border-border/40 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-primary/10">
            {ub.book.coverUrl ? (
              <Image
                src={ub.book.coverUrl}
                alt={ub.book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                표지 없음
              </div>
            )}
            {ub.status === "READING" && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${ub.progressPercent}%` }}
                />
              </div>
            )}
          </div>
          <div className="mt-3 flex flex-col gap-1">
            <p className="line-clamp-2 text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
              {ub.book.title}
            </p>
            <p className="truncate text-xs text-muted-foreground">{ub.book.author}</p>
            <Badge
              variant="outline"
              className={`mt-1 w-fit text-[10px] ${statusColors[ub.status]}`}
            >
              {statusLabels[ub.status]}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
