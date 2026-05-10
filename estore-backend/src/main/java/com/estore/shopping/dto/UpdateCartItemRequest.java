package com.estore.shopping.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateCartItemRequest(
        @NotNull(message = "Item ID is required")
        @Positive(message = "Item ID must be positive")
        Long itemId,

        @NotNull(message = "Quantity is required")
        Integer quantity
) {
}
