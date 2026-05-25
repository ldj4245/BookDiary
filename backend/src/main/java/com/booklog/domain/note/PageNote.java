package com.booklog.domain.note;

import com.booklog.domain.userbook.UserBook;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "page_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PageNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_book_id", nullable = false)
    private UserBook userBook;

    @Column(name = "page_number", nullable = false)
    private Integer pageNumber;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
