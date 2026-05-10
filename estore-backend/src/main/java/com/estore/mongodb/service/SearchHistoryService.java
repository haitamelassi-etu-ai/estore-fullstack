package com.estore.mongodb.service;

import com.estore.customer.entity.User;
import com.estore.mongodb.document.SearchHistory;
import com.estore.mongodb.repository.SearchHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SearchHistoryService {

    private final SearchHistoryRepository searchHistoryRepository;

    public SearchHistory save(User authUser, Long userId, String keyword) {
        validateOwnership(authUser, userId);
        if (keyword == null || keyword.isBlank()) {
            throw new IllegalArgumentException("Keyword is required");
        }
        SearchHistory searchHistory = SearchHistory.builder()
                .userId(userId)
                .keyword(keyword.trim())
                .searchedAt(LocalDateTime.now())
                .build();
        return searchHistoryRepository.save(searchHistory);
    }

    public List<SearchHistory> getByUser(User authUser, Long userId) {
        validateOwnership(authUser, userId);
        return searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
    }

    private void validateOwnership(User authUser, Long userId) {
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
        if (!isAdmin && !authUser.getId().equals(userId)) {
            throw new AccessDeniedException("You cannot access another user's search history");
        }
    }
}
