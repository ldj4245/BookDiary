package com.booklog.domain.userbook;

import com.booklog.common.enums.ReadingStatus;
import com.booklog.common.enums.Visibility;
import com.booklog.domain.book.Book;
import com.booklog.domain.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "user_books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private ReadingStatus status;

    @Column(name = "current_page", nullable = false)
    private Integer currentPage;

    @Column(name = "total_pages_override")
    private Integer totalPagesOverride;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(columnDefinition = "TEXT")
    private String review;

    @Column(name = "one_liner", length = 512)
    private String oneLiner;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "finished_at")
    private LocalDate finishedAt;

    @Column(columnDefinition = "JSON")
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    @Builder.Default
    private Visibility visibility = Visibility.PRIVATE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
        if (currentPage == null) {
            currentPage = 0;
        }
        if (visibility == null) {
            visibility = Visibility.PRIVATE;
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public int resolveTotalPages() {
        if (totalPagesOverride != null && totalPagesOverride > 0) {
            return totalPagesOverride;
        }
        if (book.getPageCount() != null && book.getPageCount() > 0) {
            return book.getPageCount();
        }
        return 1;
    }
}
