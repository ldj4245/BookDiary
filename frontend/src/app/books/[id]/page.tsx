"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bookmark,
  BookOpen,
  NotebookPen,
  Quote,
  Star,
  Trash2,
  FolderPlus,
} from "lucide-react";
import { toast } from "sonner";
import { InlineEditableText } from "@/components/books/InlineEditableText";
import { AddToCollectionModal } from "@/components/collections/AddToCollectionModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createPageNote,
  deletePageNote,
  deleteUserBook,
  getUserBook,
  listPageNotes,
  updateUserBook,
} from "@/lib/api/client";
import { statusColors, statusLabels } from "@/lib/labels";
import type { PageNote, ReadingStatus, UserBook } from "@/types";

const RATINGS = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5];

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const bookId = Number(id);
  const router = useRouter();
  const [ub, setUb] = useState<UserBook | null>(null);
  const [notes, setNotes] = useState<PageNote[]>([]);
  const [notePage, setNotePage] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [openCollection, setOpenCollection] = useState(false);

  useEffect(() => {
    void Promise.all([getUserBook(bookId), listPageNotes(bookId)]).then(
      ([book, nextNotes]) => {
        setUb(book);
        setNotes(nextNotes);
      },
    );
  }, [bookId]);

  const patch = async (patch: Parameters<typeof updateUserBook>[1]) => {
    try {
      const updated = await updateUserBook(bookId, patch);
      setUb(updated);
      toast.success("변경 사항이 저장되었습니다.");
    } catch (error) {
      toast.error("저장에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleAddNote = async () => {
    const page = parseInt(notePage, 10);
    if (!page || page <= 0 || !noteContent.trim()) {
      toast.warning("유효한 쪽수와 메모 내용을 모두 입력해주세요.");
      return;
    }
    try {
      const note = await createPageNote(bookId, {
        pageNumber: page,
        content: noteContent.trim(),
      });
      setNotes((prev) => [note, ...prev]);
      setNotePage("");
      setNoteContent("");
      toast.success("메모가 추가되었습니다.");
    } catch (error) {
      toast.error("메모 저장에 실패했습니다.");
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm("메모를 삭제하시겠습니까?")) return;
    try {
      await deletePageNote(bookId, noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("메모가 삭제되었습니다.");
    } catch (error) {
      toast.error("메모 삭제에 실패했습니다.");
    }
  };

  const handleDeleteBook = async () => {
    if (!confirm("정말 서재에서 이 책을 삭제하시겠습니까?\n작성한 메모와 리뷰가 모두 삭제됩니다.")) return;
    try {
      await deleteUserBook(bookId);
      toast.success("서재에서 삭제되었습니다.");
      router.push("/");
    } catch (error) {
      toast.error("삭제에 실패했습니다. 다시 시도해주세요.");
    }
  };

  if (!ub) {
    return (
      <div className="flex min-h-[400px] items-center justify-center animate-fade-slide-up">
        <p className="rounded-2xl border border-dashed border-border/40 bg-card/60 backdrop-blur-xl px-12 py-16 text-center text-sm font-medium text-muted-foreground shadow-sm">
          책을 찾을 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <header className="border-b border-border/40 pb-6 animate-fade-slide-up">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary mb-2">
          <BookOpen className="size-4" />
          독서 노트
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          기록 상세
        </h1>
      </header>

      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6 animate-fade-slide-up delay-100">
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5">
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[200px] overflow-hidden rounded-xl bg-muted/40 shadow-xl shadow-primary/10 border border-border/40 transition-transform duration-500 hover:-translate-y-2">
              {ub.book.coverUrl ? (
                <Image
                  src={ub.book.coverUrl}
                  alt={ub.book.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground bg-gradient-to-br from-primary/5 to-muted">
                  표지 없음
                </div>
              )}
            </div>
            <div className="mt-6 space-y-3 text-center">
              <Badge variant="outline" className={`border-transparent px-3 py-1 text-xs font-semibold rounded-full ${statusColors[ub.status]}`}>
                {statusLabels[ub.status]}
              </Badge>
              <h2 className="text-2xl font-bold leading-tight text-foreground px-2">
                {ub.book.title}
              </h2>
              <p className="text-sm font-medium text-muted-foreground">
                {ub.book.author}
                {ub.book.publisher && ` · ${ub.book.publisher}`}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 shadow-lg shadow-primary/5">
            <div className="mb-5 flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bookmark className="size-4" />
              </div>
              상태와 진행
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  value={ub.status}
                  onValueChange={(v) =>
                    v && void patch({ status: v as ReadingStatus })
                  }
                >
                  <SelectTrigger className="w-full bg-background/50 border-border/50 rounded-xl h-10 shadow-sm focus:ring-primary/20 transition-all hover:bg-muted/50">
                    <span className="truncate font-medium">{statusLabels[ub.status]}</span>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    {(Object.keys(statusLabels) as ReadingStatus[]).map((s) => (
                      <SelectItem key={s} value={s} className="rounded-lg">
                        {statusLabels[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={ub.rating?.toString() ?? ""}
                  onValueChange={(v) => v && void patch({ rating: Number(v) })}
                >
                  <SelectTrigger className="w-full bg-background/50 border-border/50 rounded-xl h-10 shadow-sm focus:ring-primary/20 transition-all hover:bg-muted/50">
                    <span className="truncate font-medium">
                      {ub.rating != null ? `★ ${ub.rating}` : "별점"}
                    </span>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/50">
                    {RATINGS.map((r) => (
                      <SelectItem key={r} value={r.toString()} className="rounded-lg font-medium">
                        ★ {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 p-4 rounded-xl border border-border/40 bg-muted/20">
                <Label className="text-xs font-bold text-muted-foreground flex justify-between">
                  <span>읽은 쪽수</span>
                  <span className="text-primary">{ub.progressPercent}%</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    className="w-20 bg-background/50 border-border/50 rounded-lg h-9 shadow-sm text-center font-bold focus-visible:ring-primary/20"
                    value={ub.currentPage}
                    onChange={(e) =>
                      setUb({
                        ...ub,
                        currentPage: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    onBlur={() => void patch({ currentPage: ub.currentPage })}
                  />
                  <span className="text-sm font-bold text-muted-foreground">/</span>
                  <Input
                    type="number"
                    className="w-20 bg-background/50 border-border/50 rounded-lg h-9 shadow-sm text-center font-bold focus-visible:ring-primary/20"
                    value={ub.totalPages}
                    onChange={(e) =>
                      setUb({
                        ...ub,
                        totalPages: parseInt(e.target.value, 10) || 1,
                      })
                    }
                    onBlur={() => void patch({ totalPagesOverride: ub.totalPages })}
                  />
                  <span className="text-sm font-medium text-muted-foreground">쪽</span>
                </div>
                <Progress value={ub.progressPercent} className="h-2 bg-muted/60 mt-1" />
                <Button
                  variant="outline"
                  className="w-full gap-2 rounded-xl"
                  onClick={() => setOpenCollection(true)}
                >
                  <FolderPlus className="size-4" />
                  컬렉션 관리
                </Button>
              </div>
            </div>
          </div>

          <AddToCollectionModal 
            userBookId={ub.id} 
            open={openCollection} 
            onOpenChange={setOpenCollection} 
          />

          <div className="animate-fade-slide-up delay-200 space-y-3">
            <div className="flex flex-wrap gap-2">
              {ub.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="group bg-card/60 backdrop-blur-sm border-border/50 px-3 py-1 font-medium rounded-full shadow-sm text-xs flex items-center gap-1 transition-all">
                  #{tag}
                  <button 
                    onClick={() => {
                      const newTags = ub.tags.filter(t => t !== tag);
                      setUb({ ...ub, tags: newTags });
                      void patch({ tags: newTags });
                    }} 
                    className="opacity-0 group-hover:opacity-100 text-destructive/70 hover:text-destructive transition-opacity ml-0.5"
                    title="태그 삭제"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              placeholder="새 장르/태그 추가 (Enter)"
              className="h-8 text-xs bg-background/50 border-border/50 rounded-lg shadow-sm max-w-[200px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (val && !ub.tags.includes(val)) {
                    const newTags = [...ub.tags, val];
                    setUb({ ...ub, tags: newTags });
                    void patch({ tags: newTags });
                    e.currentTarget.value = "";
                  }
                }
              }}
            />
          </div>

          <div className="pt-4 border-t border-border/40 animate-fade-slide-up delay-300">
            <button
              onClick={() => void handleDeleteBook()}
              className="text-sm font-bold text-destructive/80 hover:text-destructive flex items-center gap-2 transition-colors"
            >
              <Trash2 className="size-4" />
              서재에서 책 삭제하기
            </button>
          </div>
        </aside>

        <main className="space-y-6">
          <section className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-lg shadow-primary/5 animate-fade-slide-up delay-200">
            <div className="mb-5 flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Quote className="size-4" />
              </div>
              한줄평
            </div>
            <div className="px-1">
              <InlineEditableText
                value={ub.oneLiner ?? ""}
                onSave={(oneLiner) => void patch({ oneLiner })}
                placeholder="책을 한 문장으로 요약한다면?"
                multiline={false}
                className="text-lg font-medium leading-relaxed italic text-foreground/90 border-b border-transparent hover:border-border/50 focus:border-primary/50 transition-colors py-1"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-lg shadow-primary/5 animate-fade-slide-up delay-300">
            <div className="mb-5 flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Star className="size-4" />
              </div>
              상세 리뷰
            </div>
            <div className="px-1">
              <InlineEditableText
                value={ub.review ?? ""}
                onSave={(review) => void patch({ review })}
                placeholder="읽고 난 후의 생각과 감상을 자유롭게 남겨보세요..."
                className="min-h-[160px] leading-8 text-[15px] text-foreground/90 font-medium rounded-xl border border-transparent hover:border-border/50 focus:border-primary/50 transition-colors p-3 -ml-3"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-6 md:p-8 shadow-lg shadow-primary/5 animate-fade-slide-up delay-400">
            <div className="mb-6 flex items-center gap-2.5 text-sm font-bold">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <NotebookPen className="size-4" />
              </div>
              페이지 메모
            </div>
            
            <div className="flex flex-col gap-3 p-4 rounded-xl border border-border/40 bg-muted/20">
              <div className="flex items-center">
                <Input
                  type="number"
                  min="0"
                  placeholder="쪽수"
                  className="w-24 bg-background/80 border-border/50 shadow-sm rounded-lg font-bold focus-visible:ring-primary/20 h-9"
                  value={notePage}
                  onChange={(e) => setNotePage(e.target.value)}
                />
                <span className="ml-2 text-sm font-medium text-muted-foreground">쪽</span>
              </div>
              <Textarea
                placeholder="인상 깊은 문장이나 생각을 남겨주세요."
                className="min-h-[100px] bg-background/80 border-border/50 shadow-sm rounded-lg resize-none text-[15px] leading-relaxed focus-visible:ring-primary/20 font-medium"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={() => void handleAddNote()} className="rounded-lg shadow-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[0.98] transition-all px-6 h-9">
                  저장
                </Button>
              </div>
            </div>

            <ul className="mt-8 space-y-4">
              {notes.length > 0 ? (
                notes.map((note) => (
                  <li
                    key={note.id}
                    className="group rounded-xl border border-border/40 bg-background/40 p-5 text-[15px] shadow-sm hover:shadow-md hover:bg-background/60 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-block font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md text-xs">
                        p.{note.pageNumber}
                      </span>
                      <button
                        onClick={() => void handleDeleteNote(note.id)}
                        className="text-muted-foreground/50 hover:text-destructive transition-colors"
                        title="메모 삭제"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="whitespace-pre-wrap leading-relaxed text-foreground/90 font-medium">
                      {note.content}
                    </p>
                  </li>
                ))
              ) : (
                <li className="rounded-xl border border-dashed border-border/40 bg-background/40 px-4 py-12 text-center text-sm font-medium text-muted-foreground">
                  아직 남긴 메모가 없습니다.
                </li>
              )}
            </ul>
          </section>
        </main>
      </div>
    </div>
  );
}
