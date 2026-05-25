package com.booklog.domain.userbook;

import com.booklog.common.enums.ReadingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBookRepository extends JpaRepository<UserBook, Long> {

    List<UserBook> findByUserId(Long userId);

    List<UserBook> findByUserIdAndStatus(Long userId, ReadingStatus status);

    Optional<UserBook> findByUserIdAndId(Long userId, Long id);

    Optional<UserBook> findByUserIdAndBookId(Long userId, Long bookId);
}
