package com.booklog.domain.book;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookRepository extends JpaRepository<Book, Long> {

    List<Book> findTop20ByOrderByCreatedAtDesc();

    List<Book> findTop20ByTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title);

    List<Book> findTop20ByAuthorContainingIgnoreCaseOrderByCreatedAtDesc(String author);

    List<Book> findTop20ByIsbnContainingIgnoreCaseOrderByCreatedAtDesc(String isbn);
}
