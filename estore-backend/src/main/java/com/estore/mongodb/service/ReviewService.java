package com.estore.mongodb.service;

import com.estore.catalog.service.ProductService;
import com.estore.customer.entity.User;
import com.estore.mongodb.document.Review;
import com.estore.mongodb.dto.ReviewDTO;
import com.estore.mongodb.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductService productService;

    public List<ReviewDTO> getByProductId(Long productId) {
        productService.getProductById(productId);
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::toDTO)
                .toList();
    }

    public ReviewDTO createReview(ReviewDTO reviewDTO, User authUser) {
        productService.getProductById(reviewDTO.productId());
        Review review = Review.builder()
                .productId(reviewDTO.productId())
                .userId(authUser.getId())
                .authorName(authUser.getFirstName() + " " + authUser.getLastName())
                .rating(reviewDTO.rating())
                .comment(reviewDTO.comment().trim())
                .createdAt(LocalDateTime.now())
                .build();
        return toDTO(reviewRepository.save(review));
    }

    private ReviewDTO toDTO(Review review) {
        return ReviewDTO.builder()
                .id(review.getId())
                .productId(review.getProductId())
                .userId(review.getUserId())
                .authorName(review.getAuthorName())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
