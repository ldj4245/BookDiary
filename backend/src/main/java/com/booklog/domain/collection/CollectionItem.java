package com.booklog.domain.collection;

import com.booklog.domain.userbook.UserBook;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "collection_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "collection_id", nullable = false)
    private BookCollection collection;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_book_id", nullable = false)
    private UserBook userBook;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;
}
