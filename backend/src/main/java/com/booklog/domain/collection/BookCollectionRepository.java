package com.booklog.domain.collection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookCollectionRepository extends JpaRepository<BookCollection, Long> {

    List<BookCollection> findByUserId(Long userId);
}
