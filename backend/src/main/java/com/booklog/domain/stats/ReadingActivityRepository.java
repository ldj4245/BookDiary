package com.booklog.domain.stats;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ReadingActivityRepository extends JpaRepository<ReadingActivity, Long> {

    List<ReadingActivity> findByUserIdAndActivityDateBetween(
            Long userId, LocalDate from, LocalDate to);
}
