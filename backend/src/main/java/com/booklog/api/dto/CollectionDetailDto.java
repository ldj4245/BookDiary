package com.booklog.api.dto;

import java.util.List;

public record CollectionDetailDto(
        Long id,
        String name,
        String description,
        List<UserBookDto> books
) {
}
