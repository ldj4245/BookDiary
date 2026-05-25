import { mockSearchResults } from "@/data/mock-books";
import {
  mockGenreStats,
  mockHeatmapDays,
  mockMonthlyStats,
  mockStatsSummary,
} from "@/data/mock-stats";
import {
  addMockCollection,
  addMockNote,
  addMockUserBook,
  getMockCollections,
  getMockNotes,
  getMockUserBook,
  getMockUserBooks,
  mockUser,
  patchMockUserBook,
} from "@/lib/mock-store";
import type {
  BookSearchResult,
  Collection,
  CreateCollectionRequest,
  CreatePageNoteRequest,
  CreateUserBookRequest,
  GenreStat,
  HeatmapDay,
  MonthlyStat,
  PageNote,
  ReadingStatus,
  StatsSummary,
  UpdateUserBookRequest,
  User,
  UserBook,
} from "@/types";

const USE_MOCK =
  process.env.NEXT_PUBLIC_USE_MOCK === "true" ||
  process.env.NEXT_PUBLIC_USE_MOCK === "1";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1";

async function fetchApi<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const errorMsg = `[API Error] ${res.status} ${path} - ${text}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
  if (res.status === 204) {
    return undefined as unknown as T;
  }
  const text = await res.text();
  if (!text) return undefined as unknown as T;
  return JSON.parse(text) as T;
}

export async function getCurrentUser(): Promise<User> {
  if (USE_MOCK) return mockUser;
  return fetchApi<User>("/users/me");
}

export async function searchBooks(
  q: string,
  type?: string,
): Promise<BookSearchResult[]> {
  if (USE_MOCK) {
    const lower = q.toLowerCase();
    if (!lower.trim()) return mockSearchResults;
    return mockSearchResults.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower) ||
        (b.isbn?.includes(q) ?? false),
    );
  }
  return fetchApi<BookSearchResult[]>(
    `/books/search?q=${encodeURIComponent(q)}${
      type ? `&type=${encodeURIComponent(type)}` : ""
    }`,
  );
}

export async function listUserBooks(params?: {
  status?: ReadingStatus;
  sort?: "recent" | "rating" | "title";
}): Promise<UserBook[]> {
  if (USE_MOCK) {
    let list = getMockUserBooks();
    if (params?.status) {
      list = list.filter((ub) => ub.status === params.status);
    }
    if (params?.sort === "rating") {
      list = [...list].sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      );
    } else if (params?.sort === "title") {
      list = [...list].sort((a, b) =>
        a.book.title.localeCompare(b.book.title, "ko"),
      );
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
    }
    return list;
  }
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.sort) qs.set("sort", params.sort);
  return fetchApi<UserBook[]>(`/user-books?${qs}`);
}

export async function getUserBook(id: number): Promise<UserBook | null> {
  if (USE_MOCK) return getMockUserBook(id) ?? null;
  return fetchApi<UserBook>(`/user-books/${id}`);
}

export async function createUserBook(
  req: CreateUserBookRequest,
): Promise<UserBook> {
  if (USE_MOCK) return addMockUserBook(req);
  return fetchApi<UserBook>("/user-books", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function updateUserBook(
  id: number,
  patch: UpdateUserBookRequest,
): Promise<UserBook> {
  if (USE_MOCK) {
    const updated = patchMockUserBook(id, patch);
    if (!updated) throw new Error("UserBook not found");
    return updated;
  }
  return fetchApi<UserBook>(`/user-books/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteUserBook(id: number): Promise<void> {
  if (USE_MOCK) return;
  return fetchApi<void>(`/user-books/${id}`, {
    method: "DELETE",
  });
}

export async function listPageNotes(userBookId: number): Promise<PageNote[]> {
  if (USE_MOCK) return getMockNotes(userBookId);
  return fetchApi<PageNote[]>(`/user-books/${userBookId}/notes`);
}

export async function createPageNote(
  userBookId: number,
  req: CreatePageNoteRequest,
): Promise<PageNote> {
  if (USE_MOCK) return addMockNote(userBookId, req);
  return fetchApi<PageNote>(`/user-books/${userBookId}/notes`, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function deletePageNote(userBookId: number, noteId: number): Promise<void> {
  if (USE_MOCK) return;
  return fetchApi<void>(`/user-books/${userBookId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

export async function listCollections(): Promise<Collection[]> {
  if (USE_MOCK) return getMockCollections();
  return fetchApi<Collection[]>("/collections");
}

export async function createCollection(
  req: CreateCollectionRequest,
): Promise<Collection> {
  if (USE_MOCK) return addMockCollection(req);
  return fetchApi<Collection>("/collections", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export async function getStatsSummary(): Promise<StatsSummary> {
  if (USE_MOCK) return mockStatsSummary;
  return fetchApi<StatsSummary>("/stats/summary");
}

export async function getMonthlyStats(): Promise<MonthlyStat[]> {
  if (USE_MOCK) return mockMonthlyStats;
  return fetchApi<MonthlyStat[]>("/stats/monthly");
}

export async function getGenreStats(): Promise<GenreStat[]> {
  if (USE_MOCK) return mockGenreStats;
  return fetchApi<GenreStat[]>("/stats/genres");
}

export async function getHeatmap(): Promise<HeatmapDay[]> {
  if (USE_MOCK) return mockHeatmapDays;
  return fetchApi<HeatmapDay[]>("/stats/heatmap");
}
