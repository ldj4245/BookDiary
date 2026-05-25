package com.booklog.api.dto;

import java.time.Instant;

public record PageNoteDto(
        Long id,
        Integer pageNumber,
        String content,
        Instant createdAt
) {
}
