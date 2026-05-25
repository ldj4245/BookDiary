package com.booklog.domain.stats;

import com.booklog.common.enums.ActivityType;
import com.booklog.domain.user.User;
import com.booklog.domain.userbook.UserBook;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "reading_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_book_id")
    private UserBook userBook;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false, length = 32)
    private ActivityType activityType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
