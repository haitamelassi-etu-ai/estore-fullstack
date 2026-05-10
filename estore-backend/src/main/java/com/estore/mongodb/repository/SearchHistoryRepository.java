package com.estore.mongodb.repository;

import com.estore.mongodb.document.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(Long userId);
}
