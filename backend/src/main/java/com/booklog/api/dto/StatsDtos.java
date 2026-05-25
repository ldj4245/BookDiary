package com.booklog.api.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class StatsDtos {

    private StatsDtos() {
    }

    public record StatsSummaryDto(
            int year,
            int finishedCount,
            int yearlyGoal,
            BigDecimal goalProgressPercent,
            BigDecimal averageRating
    ) {
    }

    public record MonthlyStatDto(String month, int count) {
    }

    public record GenreStatDto(String genre, int count, BigDecimal percent) {
    }

    public record HeatmapDayDto(LocalDate date, int count) {
    }
}
