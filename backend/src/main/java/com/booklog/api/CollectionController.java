package com.booklog.api;

import com.booklog.api.dto.CollectionDto;
import com.booklog.api.dto.RequestDtos.CreateCollectionRequest;
import com.booklog.api.mapper.DtoMapper;
import com.booklog.domain.collection.BookCollection;
import com.booklog.domain.collection.BookCollectionRepository;
import com.booklog.domain.collection.CollectionItemRepository;
import com.booklog.domain.user.CurrentUserService;
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
    private final CurrentUserService currentUserService;

    public CollectionController(
            BookCollectionRepository collectionRepository,
            CollectionItemRepository itemRepository,
            CurrentUserService currentUserService
    ) {
        this.collectionRepository = collectionRepository;
        this.itemRepository = itemRepository;
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
}
