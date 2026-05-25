package com.booklog.api;

import com.booklog.api.dto.PageNoteDto;
import com.booklog.api.dto.RequestDtos.CreatePageNoteRequest;
import com.booklog.api.dto.RequestDtos.CreateUserBookRequest;
import com.booklog.api.dto.RequestDtos.UpdateUserBookRequest;
import com.booklog.api.dto.UserBookDto;
import com.booklog.api.mapper.DtoMapper;
import com.booklog.common.enums.ActivityType;
import com.booklog.common.enums.ReadingStatus;
import com.booklog.common.exception.ResourceNotFoundException;
import com.booklog.domain.book.Book;
import com.booklog.domain.book.BookRepository;
import com.booklog.domain.note.PageNote;
import com.booklog.domain.note.PageNoteRepository;
import com.booklog.domain.stats.ReadingActivity;
import com.booklog.domain.stats.ReadingActivityRepository;
import com.booklog.domain.user.CurrentUserService;
import com.booklog.domain.user.User;
import com.booklog.domain.userbook.UserBook;
import com.booklog.domain.userbook.UserBookRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/v1/user-books")
public class UserBookController {

    private final UserBookRepository userBookRepository;
    private final PageNoteRepository pageNoteRepository;
    private final BookRepository bookRepository;
    private final ReadingActivityRepository activityRepository;
    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    public UserBookController(
            UserBookRepository userBookRepository,
            PageNoteRepository pageNoteRepository,
            BookRepository bookRepository,
            ReadingActivityRepository activityRepository,
            CurrentUserService currentUserService,
            ObjectMapper objectMapper
    ) {
        this.userBookRepository = userBookRepository;
        this.pageNoteRepository = pageNoteRepository;
        this.bookRepository = bookRepository;
        this.activityRepository = activityRepository;
        this.currentUserService = currentUserService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<UserBookDto> list(
            @RequestParam(required = false) ReadingStatus status,
            @RequestParam(required = false, defaultValue = "recent") String sort
    ) {
        User user = currentUserService.getCurrentUser();
        List<UserBook> list = status == null
                ? userBookRepository.findByUserId(user.getId())
                : userBookRepository.findByUserIdAndStatus(user.getId(), status);

        Comparator<UserBook> comparator = switch (sort) {
            case "rating" -> Comparator.comparing(
                    UserBook::getRating,
                    Comparator.nullsLast(Comparator.reverseOrder())
            );
            case "title" -> Comparator.comparing(ub -> ub.getBook().getTitle());
            default -> Comparator.comparing(UserBook::getUpdatedAt).reversed();
        };
        return list.stream().sorted(comparator).map(DtoMapper::toUserBookDto).toList();
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public UserBookDto get(@PathVariable Long id) {
        return DtoMapper.toUserBookDto(findUserBook(id));
    }

    @PostMapping
    @Transactional
    public ResponseEntity<UserBookDto> create(@Valid @RequestBody CreateUserBookRequest request) {
        User user = currentUserService.getCurrentUser();
        Book book = resolveBook(request);
        var existing = userBookRepository.findByUserIdAndBookId(user.getId(), book.getId());
        if (existing.isPresent()) {
            return ResponseEntity.ok(DtoMapper.toUserBookDto(existing.get()));
        }

        UserBook ub = UserBook.builder()
                .user(user)
                .book(book)
                .status(request.status() == null ? ReadingStatus.WANT_TO_READ : request.status())
                .currentPage(0)
                .tags("[]")
                .build();
        UserBook saved = userBookRepository.save(ub);
        recordActivity(user, saved, ActivityType.STATUS_CHANGED);
        return ResponseEntity.status(201).body(DtoMapper.toUserBookDto(saved));
    }

    @PatchMapping("/{id}")
    @Transactional
    public UserBookDto patch(@PathVariable Long id, @RequestBody UpdateUserBookRequest request) {
        User user = currentUserService.getCurrentUser();
        UserBook ub = findUserBook(id);
        ReadingStatus beforeStatus = ub.getStatus();
        Integer beforePage = ub.getCurrentPage();

        if (request.status() != null) {
            ub.setStatus(request.status());
            if (request.status() == ReadingStatus.READING && ub.getStartedAt() == null) {
                ub.setStartedAt(java.time.LocalDate.now());
            }
            if (request.status() == ReadingStatus.FINISHED) {
                if (ub.getFinishedAt() == null) {
                    ub.setFinishedAt(java.time.LocalDate.now());
                }
                ub.setCurrentPage(ub.resolveTotalPages());
            }
        }
        if (request.currentPage() != null) {
            ub.setCurrentPage(Math.max(0, request.currentPage()));
        }
        if (request.rating() != null) ub.setRating(request.rating());
        if (request.review() != null) ub.setReview(request.review());
        if (request.oneLiner() != null) ub.setOneLiner(request.oneLiner());
        if (request.startedAt() != null) ub.setStartedAt(request.startedAt());
        if (request.finishedAt() != null) ub.setFinishedAt(request.finishedAt());
        if (request.tags() != null) ub.setTags(toJson(request.tags()));

        UserBook saved = userBookRepository.save(ub);
        if (request.status() != null && beforeStatus != request.status()) {
            recordActivity(
                    user,
                    saved,
                    request.status() == ReadingStatus.FINISHED
                            ? ActivityType.FINISHED
                            : ActivityType.STATUS_CHANGED
            );
        } else if (request.currentPage() != null && !request.currentPage().equals(beforePage)) {
            recordActivity(user, saved, ActivityType.PAGE_UPDATE);
        }
        return DtoMapper.toUserBookDto(saved);
    }

    @GetMapping("/{id}/notes")
    @Transactional(readOnly = true)
    public List<PageNoteDto> listNotes(@PathVariable Long id) {
        findUserBook(id);
        return pageNoteRepository.findByUserBookIdOrderByPageNumberAsc(id).stream()
                .map(DtoMapper::toPageNoteDto)
                .toList();
    }

    @PostMapping("/{id}/notes")
    @Transactional
    public ResponseEntity<PageNoteDto> createNote(
            @PathVariable Long id,
            @Valid @RequestBody CreatePageNoteRequest request
    ) {
        User user = currentUserService.getCurrentUser();
        UserBook ub = findUserBook(id);
        PageNote note = PageNote.builder()
                .userBook(ub)
                .pageNumber(request.pageNumber())
                .content(request.content())
                .build();
        PageNote saved = pageNoteRepository.save(note);
        recordActivity(user, ub, ActivityType.NOTE_ADDED);
        return ResponseEntity.status(201).body(DtoMapper.toPageNoteDto(saved));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUserBook(@PathVariable Long id) {
        UserBook ub = findUserBook(id);
        userBookRepository.delete(ub);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    @Transactional
    public ResponseEntity<Void> deleteNote(@PathVariable Long id, @PathVariable Long noteId) {
        UserBook ub = findUserBook(id);
        PageNote note = pageNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found: " + noteId));
        
        if (!note.getUserBook().getId().equals(ub.getId())) {
            throw new IllegalArgumentException("Note does not belong to this book");
        }
        
        pageNoteRepository.delete(note);
        return ResponseEntity.noContent().build();
    }

    private UserBook findUserBook(Long id) {
        User user = currentUserService.getCurrentUser();
        return userBookRepository.findByUserIdAndId(user.getId(), id)
                .orElseThrow(() -> new ResourceNotFoundException("UserBook not found: " + id));
    }

    private Book resolveBook(CreateUserBookRequest request) {
        if (request.bookId() != null) {
            return bookRepository.findById(request.bookId())
                    .orElseThrow(() ->
                            new ResourceNotFoundException("Book not found: " + request.bookId()));
        }
        if (request.book() == null) {
            throw new IllegalArgumentException("bookId or book is required");
        }
        Book book = Book.builder()
                .title(request.book().title())
                .author(request.book().author())
                .isbn(request.book().isbn())
                .coverUrl(request.book().coverUrl())
                .pageCount(request.book().pageCount())
                .publisher(request.book().publisher())
                .build();
        return bookRepository.save(book);
    }

    private String toJson(List<String> tags) {
        try {
            return objectMapper.writeValueAsString(tags);
        } catch (JsonProcessingException e) {
            throw new IllegalArgumentException("Invalid tags", e);
        }
    }

    private void recordActivity(User user, UserBook userBook, ActivityType type) {
        activityRepository.save(ReadingActivity.builder()
                .user(user)
                .userBook(userBook)
                .activityDate(java.time.LocalDate.now())
                .activityType(type)
                .build());
    }
}
