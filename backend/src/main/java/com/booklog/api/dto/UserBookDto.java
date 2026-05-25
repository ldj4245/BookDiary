package com.booklog.api.dto;

import com.booklog.common.enums.ReadingStatus;
import com.booklog.common.enums.Visibility;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record UserBookDto(
        Long id,
        BookDto book,
        ReadingStatus status,
        Integer currentPage,
        Integer totalPages,
        Float progressPercent,
        BigDecimal rating,
        String review,
        String oneLiner,
        LocalDate startedAt,
        LocalDate finishedAt,
        java.util.List<String> tags,
        Visibility visibility,
        Instant updatedAt
) {
}
