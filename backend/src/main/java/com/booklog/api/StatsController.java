package com.booklog.api;

import com.booklog.api.dto.StatsDtos.GenreStatDto;
import com.booklog.api.dto.StatsDtos.HeatmapDayDto;
import com.booklog.api.dto.StatsDtos.MonthlyStatDto;
import com.booklog.api.dto.StatsDtos.StatsSummaryDto;
import com.booklog.common.enums.ReadingStatus;
import com.booklog.domain.stats.ReadingActivityRepository;
import com.booklog.domain.user.CurrentUserService;
import com.booklog.domain.user.User;
import com.booklog.domain.userbook.UserBook;
import com.booklog.domain.userbook.UserBookRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private static final int DEFAULT_YEARLY_GOAL = 24;

    private final CurrentUserService currentUserService;
    private final UserBookRepository userBookRepository;
    private final ReadingActivityRepository activityRepository;
    private final ObjectMapper objectMapper;

    public StatsController(
            CurrentUserService currentUserService,
            UserBookRepository userBookRepository,
            ReadingActivityRepository activityRepository,
            ObjectMapper objectMapper
    ) {
        this.currentUserService = currentUserService;
        this.userBookRepository = userBookRepository;
        this.activityRepository = activityRepository;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/summary")
    @Transactional(readOnly = true)
    public StatsSummaryDto summary() {
        User user = currentUserService.getCurrentUser();
        List<UserBook> books = userBookRepository.findByUserId(user.getId());
        int year = Year.now().getValue();
        int yearlyGoal = (user.getYearlyGoal() != null && user.getYearlyGoal() > 0)
                ? user.getYearlyGoal()
                : DEFAULT_YEARLY_GOAL;
        int finishedCount = (int) books.stream()
                .filter(book -> book.getStatus() == ReadingStatus.FINISHED)
                .count();
        BigDecimal progress = BigDecimal.valueOf(finishedCount)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(yearlyGoal), 1, RoundingMode.HALF_UP);
        BigDecimal averageRating = books.stream()
                .map(UserBook::getRating)
                .filter(rating -> rating != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long ratingCount = books.stream().filter(book -> book.getRating() != null).count();
        if (ratingCount > 0) {
            averageRating = averageRating.divide(
                    BigDecimal.valueOf(ratingCount), 1, RoundingMode.HALF_UP);
        }
        return new StatsSummaryDto(year, finishedCount, yearlyGoal, progress, averageRating);
    }

    @GetMapping("/monthly")
    @Transactional(readOnly = true)
    public List<MonthlyStatDto> monthly() {
        User user = currentUserService.getCurrentUser();
        int year = Year.now().getValue();
        Map<Integer, Long> counts = userBookRepository.findByUserId(user.getId()).stream()
                .filter(book -> book.getStatus() == ReadingStatus.FINISHED)
                .filter(book -> book.getFinishedAt() != null)
                .filter(book -> book.getFinishedAt().getYear() == year)
                .collect(Collectors.groupingBy(
                        book -> book.getFinishedAt().getMonthValue(),
                        Collectors.counting()));
        return java.util.stream.IntStream.rangeClosed(1, 12)
                .mapToObj(month -> new MonthlyStatDto(
                        month + "월",
                        counts.getOrDefault(month, 0L).intValue()))
                .toList();
    }

    @GetMapping("/genres")
    @Transactional(readOnly = true)
    public List<GenreStatDto> genres() {
        User user = currentUserService.getCurrentUser();
        Map<String, Integer> counts = new LinkedHashMap<>();
        userBookRepository.findByUserId(user.getId()).forEach(book -> {
            for (String tag : parseTags(book.getTags())) {
                counts.merge(tag, 1, Integer::sum);
            }
        });
        int total = counts.values().stream().mapToInt(Integer::intValue).sum();
        if (total == 0) {
            return List.of();
        }
        return counts.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(6)
                .map(entry -> new GenreStatDto(
                        entry.getKey(),
                        entry.getValue(),
                        BigDecimal.valueOf(entry.getValue())
                                .multiply(BigDecimal.valueOf(100))
                                .divide(BigDecimal.valueOf(total), 1, RoundingMode.HALF_UP)))
                .toList();
    }

    @GetMapping("/heatmap")
    @Transactional(readOnly = true)
    public List<HeatmapDayDto> heatmap() {
        User user = currentUserService.getCurrentUser();
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(364);
        Map<LocalDate, Long> counts = activityRepository
                .findByUserIdAndActivityDateBetween(user.getId(), from, to)
                .stream()
                .collect(Collectors.groupingBy(
                        activity -> activity.getActivityDate(),
                        Collectors.counting()));
        return from.datesUntil(to.plusDays(1))
                .map(date -> new HeatmapDayDto(
                        date,
                        counts.getOrDefault(date, 0L).intValue()))
                .toList();
    }

    private List<String> parseTags(String json) {
        if (json == null || json.isBlank()) {
            return List.of();
        }
        try {
            String normalized = json.trim();
            if (normalized.startsWith("\"") && normalized.endsWith("\"")) {
                normalized = objectMapper.readValue(normalized, String.class);
            }
            return objectMapper.readValue(normalized, new TypeReference<>() {
            });
        } catch (Exception e) {
            return List.of();
        }
    }
}
