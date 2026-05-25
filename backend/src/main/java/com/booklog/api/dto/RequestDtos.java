package com.booklog.api.dto;

import com.booklog.common.enums.ReadingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class RequestDtos {

    private RequestDtos() {
    }

    public record CreateBookRequest(
            @NotBlank String title,
            @NotBlank String author,
            String isbn,
            String coverUrl,
            Integer pageCount,
            String publisher
    ) {
    }

    public record CreateUserBookRequest(
            Long bookId,
            CreateBookRequest book,
            ReadingStatus status
    ) {
    }

    public record UpdateUserBookRequest(
            ReadingStatus status,
            Integer currentPage,
            BigDecimal rating,
            String review,
            String oneLiner,
            LocalDate startedAt,
            LocalDate finishedAt,
            List<String> tags
    ) {
    }

    public record CreatePageNoteRequest(
            @NotNull Integer pageNumber,
            @NotBlank String content
    ) {
    }

    public record CreateCollectionRequest(
            @NotBlank String name,
            String description
    ) {
    }
}
