"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Trash2, BookOpen, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCollection, deleteCollection, removeCollectionItem } from "@/lib/api/client";
import { statusLabels } from "@/lib/labels";
import type { CollectionDetail } from "@/types";
import { toast } from "sonner";

export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getCollection(id)
      .then(setCollection)
      .catch(() => {
        toast.error("컬렉션을 불러오지 못했습니다.");
        router.push("/collections");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleDeleteCollection = async () => {
    if (!window.confirm(`'${collection?.name}' 컬렉션을 삭제하시겠습니까?\n(포함된 책 기록은 삭제되지 않습니다)`)) {
      return;
    }
    try {
      await deleteCollection(id);
      toast.success("컬렉션이 삭제되었습니다.");
      router.push("/collections");
    } catch {
      toast.error("컬렉션 삭제에 실패했습니다.");
    }
  };

  const handleRemoveItem = async (userBookId: number) => {
    if (!window.confirm("이 책을 컬렉션에서 제거하시겠습니까?")) return;
    try {
      await removeCollectionItem(id, userBookId);
      toast.success("책이 제거되었습니다.");
      load();
    } catch {
      toast.error("책 제거에 실패했습니다.");
    }
  };

  if (loading) return null;
  if (!collection) return null;

  return (
    <div className="space-y-7 pb-20">
      <header className="flex flex-col gap-4 border-b border-border/70 pb-6 md:flex-row md:items-end md:justify-between animate-fade-slide-up">
        <div>
          <Link 
            href="/collections" 
            className="flex w-fit items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="size-3" />
            컬렉션 목록으로
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {collection.name}
          </h1>
          {collection.description && (
            <p className="mt-2 text-sm text-muted-foreground font-medium">
              {collection.description}
            </p>
          )}
          <p className="mt-4 inline-flex px-2 py-1 rounded-md bg-primary/10 text-xs font-bold text-primary">
            총 {collection.books.length}권
          </p>
        </div>
        
        <Button 
          variant="outline" 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 gap-2 border-border/50 transition-colors"
          onClick={handleDeleteCollection}
        >
          <Trash2 className="size-4" />
          이 컬렉션 삭제
        </Button>
      </header>

      {collection.books.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-slide-up delay-100">
          {collection.books.map((userBook) => (
            <article 
              key={userBook.id} 
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all hover:shadow-md hover:border-border/80"
            >
              <Link href={`/books/${userBook.id}`} className="flex flex-1 flex-col">
                <div className="relative aspect-[3/4] w-full bg-muted overflow-hidden">
                  {userBook.book.coverUrl ? (
                    <Image
                      src={userBook.book.coverUrl}
                      alt={userBook.book.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground bg-gradient-to-br from-primary/5 to-muted">
                      표지 없음
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold shadow-sm">
                    {statusLabels[userBook.status]}
                  </div>
                </div>
                <div className="flex flex-col p-4 flex-1">
                  <h3 className="font-bold text-foreground line-clamp-1 leading-tight">
                    {userBook.book.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-muted-foreground truncate">
                    {userBook.book.author}
                  </p>
                </div>
              </Link>
              
              <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8 rounded-full shadow-md hover:scale-105 transition-transform"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveItem(userBook.id);
                  }}
                  title="컬렉션에서 제거"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-[var(--paper)] py-20 px-4 text-center animate-fade-slide-up delay-100">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
            <BookOpen className="size-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">비어있는 컬렉션입니다</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            아직 이 컬렉션에 담긴 책이 없습니다. 서재에서 책을 선택해 컬렉션에 추가해보세요.
          </p>
          <Link href="/library" className="mt-6">
            <Button>서재로 이동하기</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
