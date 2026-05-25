package com.booklog.api.dto;

import jakarta.validation.constraints.Size;

public record UpdateUserProfileRequest(
        @Size(min = 2, max = 30)
        String nickname,
        
        Integer yearlyGoal
) {
}
