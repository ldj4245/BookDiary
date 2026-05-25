package com.booklog.domain.book;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "books")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 64)
    private String isbn;

    @Column(nullable = false, length = 512)
    private String title;

    @Column(nullable = false, length = 256)
    private String author;

    @Column(name = "cover_url", length = 512)
    private String coverUrl;

    @Column(name = "page_count")
    private Integer pageCount;

    @Column(length = 256)
    private String publisher;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }
}
