package com.estore.mongodb.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ReviewDTO(
        String id,
        @NotNull(message = "Product ID is required")
        Long productId,
        Long userId,
        String authorName,
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating must be at most 5")
        Integer rating,
        @NotBlank(message = "Comment is required")
        @Size(min = 10, max = 1000, message = "Comment must be between 10 and 1000 characters")
        String comment,
        LocalDateTime createdAt
) {
}
