package com.estore.mongodb.controller;

import com.estore.customer.entity.User;
import com.estore.customer.service.UserService;
import com.estore.mongodb.document.SearchHistory;
import com.estore.mongodb.service.SearchHistoryService;
import com.estore.shared.response.ApiResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search-history")
@RequiredArgsConstructor
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<SearchHistory>> save(@RequestBody Map<String, String> body,
                                                           Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        Long userId;
        try {
            userId = Long.valueOf(body.getOrDefault("userId", "0"));
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        if (userId <= 0) {
            throw new IllegalArgumentException("Valid userId is required");
        }
        String keyword = body.getOrDefault("keyword", "").trim();
        SearchHistory saved = searchHistoryService.save(authUser, userId, keyword);
        return ResponseEntity.ok(ApiResponse.success("Search history saved", saved));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<SearchHistory>>> getByUser(@PathVariable @NotNull Long userId,
                                                                       Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(searchHistoryService.getByUser(authUser, userId)));
    }
}
