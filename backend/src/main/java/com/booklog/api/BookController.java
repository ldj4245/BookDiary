package com.booklog.api;

import com.booklog.api.dto.BookDto;
import com.booklog.api.dto.BookSearchResultDto;
import com.booklog.api.dto.RequestDtos.CreateBookRequest;
import com.booklog.api.mapper.DtoMapper;
import com.booklog.domain.book.Book;
import com.booklog.domain.book.BookRepository;
import com.booklog.infra.KakaoBookClient;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final KakaoBookClient kakaoBookClient;
    private final BookRepository bookRepository;

    public BookController(KakaoBookClient kakaoBookClient, BookRepository bookRepository) {
        this.kakaoBookClient = kakaoBookClient;
        this.bookRepository = bookRepository;
    }

    @GetMapping("/search")
    public List<BookSearchResultDto> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "title") String type
    ) {
        List<BookSearchResultDto> externalResults = kakaoBookClient.search(q, type);
        if (!externalResults.isEmpty()) {
            return externalResults;
        }
        String keyword = q == null ? "" : q.trim();
        List<Book> books = switch (type) {
            case "author" -> keyword.isBlank()
                    ? bookRepository.findTop20ByOrderByCreatedAtDesc()
                    : bookRepository.findTop20ByAuthorContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
            case "isbn" -> keyword.isBlank()
                    ? bookRepository.findTop20ByOrderByCreatedAtDesc()
                    : bookRepository.findTop20ByIsbnContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
            default -> keyword.isBlank()
                    ? bookRepository.findTop20ByOrderByCreatedAtDesc()
                    : bookRepository.findTop20ByTitleContainingIgnoreCaseOrderByCreatedAtDesc(keyword);
        };
        return books.stream()
                .map(book -> new BookSearchResultDto(
                        book.getId(),
                        book.getIsbn(),
                        book.getTitle(),
                        book.getAuthor(),
                        book.getCoverUrl(),
                        book.getPageCount(),
                        book.getPublisher(),
                        "manual"))
                .toList();
    }

    @PostMapping
    public ResponseEntity<BookDto> create(@Valid @RequestBody CreateBookRequest request) {
        Book book = Book.builder()
                .title(request.title())
                .author(request.author())
                .isbn(request.isbn())
                .coverUrl(request.coverUrl())
                .pageCount(request.pageCount())
                .publisher(request.publisher())
                .build();
        return ResponseEntity.status(201).body(DtoMapper.toBookDto(bookRepository.save(book)));
    }
}
