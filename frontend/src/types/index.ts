export type ReadingStatus = "WANT_TO_READ" | "READING" | "FINISHED" | "DNF";
export type Visibility = "PUBLIC" | "FOLLOWERS" | "PRIVATE";

export interface Book {
  id: number;
  isbn?: string;
  title: string;
  author: string;
  coverUrl?: string;
  pageCount?: number;
  publisher?: string;
}

export interface BookSearchResult extends Book {
  source: "kakao" | "manual";
}

export interface User {
  id: number;
  nickname: string;
  profileImageUrl?: string;
  provider: string;
  yearlyGoal?: number;
}

export interface UserBook {
  id: number;
  book: Book;
  status: ReadingStatus;
  currentPage: number;
  totalPages: number;
  progressPercent: number;
  rating?: number;
  review?: string;
  oneLiner?: string;
  startedAt?: string;
  finishedAt?: string;
  tags: string[];
  visibility: Visibility;
  updatedAt: string;
}

export interface PageNote {
  id: number;
  pageNumber: number;
  content: string;
  createdAt: string;
}

export interface Collection {
  id: number;
  name: string;
  description?: string;
  userBookIds: number[];
}

export interface CollectionDetail {
  id: number;
  name: string;
  description?: string;
  books: UserBook[];
}

export interface StatsSummary {
  year: number;
  finishedCount: number;
  yearlyGoal: number;
  goalProgressPercent: number;
  averageRating: number;
}

export interface MonthlyStat {
  month: string;
  count: number;
}

export interface GenreStat {
  genre: string;
  count: number;
  percent: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
}

export interface CreateUserBookRequest {
  bookId?: number;
  book?: Partial<Book>;
  status?: ReadingStatus;
}

export interface UpdateUserBookRequest {
  status?: ReadingStatus;
  currentPage?: number;
  rating?: number;
  review?: string;
  oneLiner?: string;
  startedAt?: string;
  finishedAt?: string;
  tags?: string[];
}

export interface CreatePageNoteRequest {
  pageNumber: number;
  content: string;
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
}
