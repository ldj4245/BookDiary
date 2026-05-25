package com.booklog.domain.note;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PageNoteRepository extends JpaRepository<PageNote, Long> {

    List<PageNote> findByUserBookIdOrderByPageNumberAsc(Long userBookId);
}
