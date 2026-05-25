import type { ReadingStatus } from "@/types";

export const statusLabels: Record<ReadingStatus, string> = {
  WANT_TO_READ: "관심",
  READING: "읽는 중",
  FINISHED: "완독",
  DNF: "중단",
};

export const statusColors: Record<ReadingStatus, string> = {
  WANT_TO_READ: "border-[#657a5b]/20 bg-[#e4eadc] text-[#4d6347]",
  READING: "border-[#b98542]/25 bg-[#f2e4cf] text-[#765528]",
  FINISHED: "border-[#657a5b]/25 bg-[#dce8d5] text-[#41563d]",
  DNF: "border-[#7c3f3b]/20 bg-[#ead9d5] text-[#70403c]",
};
