package com.booklog.domain.collection;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollectionItemRepository extends JpaRepository<CollectionItem, Long> {

    List<CollectionItem> findByCollectionId(Long collectionId);

    List<CollectionItem> findByCollectionIdOrderBySortOrderAsc(Long collectionId);

    java.util.Optional<CollectionItem> findByCollectionIdAndUserBookId(Long collectionId, Long userBookId);

    void deleteByCollectionIdAndUserBookId(Long collectionId, Long userBookId);
}
