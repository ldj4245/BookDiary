package com.booklog.api.dto;

import java.util.List;

public record CollectionDto(
        Long id,
        String name,
        String description,
        List<Long> userBookIds
) {
}
