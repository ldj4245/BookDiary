package com.booklog.api.dto;

public record UserDto(
        Long id,
        String nickname,
        String profileImageUrl,
        String provider,
        Integer yearlyGoal
) {
}
