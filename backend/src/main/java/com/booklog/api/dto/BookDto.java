package com.booklog.api.dto;

public record BookDto(
        Long id,
        String isbn,
        String title,
        String author,
        String coverUrl,
        Integer pageCount,
        String publisher
) {
}
