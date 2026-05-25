package com.booklog.api.mapper;

import com.booklog.api.dto.*;
import com.booklog.domain.book.Book;
import com.booklog.domain.collection.BookCollection;
import com.booklog.domain.collection.CollectionItem;
import com.booklog.domain.note.PageNote;
import com.booklog.domain.user.User;
import com.booklog.domain.userbook.UserBook;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;
import java.util.List;

public final class DtoMapper {

    private static final ObjectMapper JSON = new ObjectMapper();

    private DtoMapper() {
    }

    public static BookDto toBookDto(Book book) {
        return new BookDto(
                book.getId(),
                book.getIsbn(),
                book.getTitle(),
                book.getAuthor(),
                book.getCoverUrl(),
                book.getPageCount(),
                book.getPublisher()
        );
    }

    public static UserDto toUserDto(User user) {
        return new UserDto(
                user.getId(),
                user.getNickname(),
                user.getProfileImageUrl(),
                user.getProvider().name().toLowerCase(),
                user.getYearlyGoal()
        );
    }

    public static UserBookDto toUserBookDto(UserBook ub) {
        int total = ub.resolveTotalPages();
        float progress = total > 0
                ? Math.min(100f, (ub.getCurrentPage() * 100f) / total)
                : 0f;
        return new UserBookDto(
                ub.getId(),
                toBookDto(ub.getBook()),
                ub.getStatus(),
                ub.getCurrentPage(),
                total,
                progress,
                ub.getRating(),
                ub.getReview(),
                ub.getOneLiner(),
                ub.getStartedAt(),
                ub.getFinishedAt(),
                parseTags(ub.getTags()),
                ub.getVisibility(),
                ub.getUpdatedAt()
        );
    }

    public static PageNoteDto toPageNoteDto(PageNote note) {
        return new PageNoteDto(
                note.getId(),
                note.getPageNumber(),
                note.getContent(),
                note.getCreatedAt()
        );
    }

    public static CollectionDto toCollectionDto(
            BookCollection collection,
            List<CollectionItem> items
    ) {
        List<Long> ids = items.stream()
                .map(i -> i.getUserBook().getId())
                .toList();
        return new CollectionDto(
                collection.getId(),
                collection.getName(),
                collection.getDescription(),
                ids
        );
    }

    private static List<String> parseTags(String json) {
        if (json == null || json.isBlank()) {
            return Collections.emptyList();
        }
        try {
            String normalized = json.trim();
            if (normalized.startsWith("\"") && normalized.endsWith("\"")) {
                normalized = JSON.readValue(normalized, String.class);
            }
            return JSON.readValue(normalized, new TypeReference<>() {
            });
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
