import type { PageNote } from "@/types";

export const initialPageNotes: Record<number, PageNote[]> = {
  1: [
    {
      id: 1,
      pageNumber: 42,
      content: "기억이 살인을 정당화하는가 — 이 질문이 계속 맴돈다.",
      createdAt: "2026-05-10T14:00:00Z",
    },
    {
      id: 2,
      pageNumber: 98,
      content: "문장 호흡이 짧아지는 구간. 긴장감 상승.",
      createdAt: "2026-05-15T09:30:00Z",
    },
  ],
  2: [
    {
      id: 3,
      pageNumber: 120,
      content: "회의실 장면. 현실감이 너무 선명하다.",
      createdAt: "2026-01-15T20:00:00Z",
    },
  ],
};
