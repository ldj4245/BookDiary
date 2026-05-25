package com.booklog.api;

import com.booklog.api.dto.CollectionDetailDto;
import com.booklog.api.dto.CollectionDto;
import com.booklog.api.dto.RequestDtos.AddCollectionItemRequest;
import com.booklog.api.dto.RequestDtos.CreateCollectionRequest;
import com.booklog.api.dto.UserBookDto;
import com.booklog.api.mapper.DtoMapper;
import com.booklog.domain.collection.BookCollection;
import com.booklog.domain.collection.BookCollectionRepository;
import com.booklog.domain.collection.CollectionItem;
import com.booklog.domain.collection.CollectionItemRepository;
import com.booklog.domain.user.CurrentUserService;
import com.booklog.domain.user.User;
import com.booklog.domain.userbook.UserBook;
import com.booklog.domain.userbook.UserBookRepository;
import com.booklog.domain.user.User;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/collections")
public class CollectionController {

    private final BookCollectionRepository collectionRepository;
    private final CollectionItemRepository itemRepository;
    private final UserBookRepository userBookRepository;
    private final CurrentUserService currentUserService;

    public CollectionController(
            BookCollectionRepository collectionRepository,
            CollectionItemRepository itemRepository,
            UserBookRepository userBookRepository,
            CurrentUserService currentUserService
    ) {
        this.collectionRepository = collectionRepository;
        this.itemRepository = itemRepository;
        this.userBookRepository = userBookRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<CollectionDto> list() {
        User user = currentUserService.getCurrentUser();
        return collectionRepository.findByUserId(user.getId()).stream()
                .map(collection -> DtoMapper.toCollectionDto(
                        collection,
                        itemRepository.findByCollectionIdOrderBySortOrderAsc(collection.getId())))
                .toList();
    }

    @PostMapping
    @Transactional
    public ResponseEntity<CollectionDto> create(@Valid @RequestBody CreateCollectionRequest request) {
        User user = currentUserService.getCurrentUser();
        BookCollection collection = collectionRepository.save(BookCollection.builder()
                .user(user)
                .name(request.name())
                .description(request.description())
                .build());
        return ResponseEntity.status(201).body(DtoMapper.toCollectionDto(collection, List.of()));
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public CollectionDetailDto getCollection(@PathVariable("id") Long id) {
        User user = currentUserService.getCurrentUser();
        BookCollection collection = collectionRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        List<UserBookDto> books = itemRepository.findByCollectionIdOrderBySortOrderAsc(id).stream()
                .map(item -> DtoMapper.toUserBookDto(item.getUserBook()))
                .toList();

        return new CollectionDetailDto(
                collection.getId(),
                collection.getName(),
                collection.getDescription(),
                books
        );
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteCollection(@PathVariable("id") Long id) {
        User user = currentUserService.getCurrentUser();
        BookCollection collection = collectionRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        itemRepository.deleteAll(itemRepository.findByCollectionId(id));
        collectionRepository.delete(collection);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/items")
    @Transactional
    public ResponseEntity<Void> addItem(
            @PathVariable("id") Long id,
            @Valid @RequestBody AddCollectionItemRequest request
    ) {
        User user = currentUserService.getCurrentUser();
        BookCollection collection = collectionRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        UserBook userBook = userBookRepository.findById(request.userBookId())
                .filter(ub -> ub.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("UserBook not found"));

        if (itemRepository.findByCollectionIdAndUserBookId(id, request.userBookId()).isEmpty()) {
            itemRepository.save(CollectionItem.builder()
                    .collection(collection)
                    .userBook(userBook)
                    .sortOrder((int) itemRepository.count())
                    .build());
        }
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping("/{id}/items/{userBookId}")
    @Transactional
    public ResponseEntity<Void> removeItem(
            @PathVariable("id") Long id,
            @PathVariable("userBookId") Long userBookId
    ) {
        User user = currentUserService.getCurrentUser();
        BookCollection collection = collectionRepository.findById(id)
                .filter(c -> c.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Collection not found"));

        itemRepository.deleteByCollectionIdAndUserBookId(id, userBookId);
        return ResponseEntity.noContent().build();
    }
}
