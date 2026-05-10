package com.estore.mongodb.controller;

import com.estore.customer.entity.User;
import com.estore.customer.service.UserService;
import com.estore.mongodb.dto.ReviewDTO;
import com.estore.mongodb.service.ReviewService;
import com.estore.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<ApiResponse<List<ReviewDTO>>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getByProductId(productId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDTO>> create(@Valid @RequestBody ReviewDTO reviewDTO,
                                                         Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        ReviewDTO created = reviewService.createReview(reviewDTO, authUser);
        return ResponseEntity.ok(ApiResponse.success("Review added successfully", created));
    }
}
