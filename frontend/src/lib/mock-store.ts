"use client";

import { initialCollections } from "@/data/mock-collections";
import { initialPageNotes } from "@/data/mock-notes";
import { initialUserBooks } from "@/data/mock-user-books";
import type {
  Collection,
  CreateCollectionRequest,
  CreatePageNoteRequest,
  CreateUserBookRequest,
  PageNote,
  UpdateUserBookRequest,
  User,
  UserBook,
} from "@/types";

let userBooks = [...initialUserBooks];
let collections = [...initialCollections];
let pageNotes: Record<number, PageNote[]> = { ...initialPageNotes };
let nextUserBookId = 10;
let nextNoteId = 100;
let nextCollectionId = 10;

export const mockUser: User = {
  id: 1,
  nickname: "독서가",
  profileImageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=booklog",
  provider: "kakao",
};

function recalcProgress(ub: UserBook): UserBook {
  const total = ub.totalPages || ub.book.pageCount || 1;
  const progressPercent = Math.min(
    100,
    Math.round((ub.currentPage / total) * 100),
  );
  return { ...ub, totalPages: total, progressPercent };
}

export function getMockUserBooks(): UserBook[] {
  return [...userBooks];
}

export function getMockUserBook(id: number): UserBook | undefined {
  return userBooks.find((ub) => ub.id === id);
}

export function patchMockUserBook(
  id: number,
  patch: UpdateUserBookRequest,
): UserBook | undefined {
  const idx = userBooks.findIndex((ub) => ub.id === id);
  if (idx < 0) return undefined;
  const updated = recalcProgress({
    ...userBooks[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  });
  userBooks[idx] = updated;
  return updated;
}

export function addMockUserBook(req: CreateUserBookRequest): UserBook {
  const book = req.book
    ? {
        id: nextUserBookId,
        title: req.book.title ?? "제목 없음",
        author: req.book.author ?? "저자 미상",
        ...req.book,
      }
    : {
        id: req.bookId ?? nextUserBookId,
        title: "새 책",
        author: "저자 미상",
      };
  const total = book.pageCount ?? 200;
  const ub: UserBook = recalcProgress({
    id: nextUserBookId++,
    book,
    status: req.status ?? "WANT_TO_READ",
    currentPage: 0,
    totalPages: total,
    progressPercent: 0,
    tags: [],
    visibility: "PRIVATE",
    updatedAt: new Date().toISOString(),
  });
  userBooks = [ub, ...userBooks];
  return ub;
}

export function getMockNotes(userBookId: number): PageNote[] {
  return [...(pageNotes[userBookId] ?? [])];
}

export function addMockNote(
  userBookId: number,
  req: CreatePageNoteRequest,
): PageNote {
  const note: PageNote = {
    id: nextNoteId++,
    pageNumber: req.pageNumber,
    content: req.content,
    createdAt: new Date().toISOString(),
  };
  pageNotes[userBookId] = [note, ...(pageNotes[userBookId] ?? [])];
  return note;
}

export function getMockCollections(): Collection[] {
  return [...collections];
}

export function addMockCollection(req: CreateCollectionRequest): Collection {
  const c: Collection = {
    id: nextCollectionId++,
    name: req.name,
    description: req.description,
    userBookIds: [],
  };
  collections = [c, ...collections];
  return c;
}

export function resetMockStore() {
  userBooks = [...initialUserBooks];
  collections = [...initialCollections];
  pageNotes = { ...initialPageNotes };
}
