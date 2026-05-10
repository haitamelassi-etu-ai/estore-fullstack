package com.estore.billing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PlaceOrderRequest(
        @NotNull(message = "User ID is required")
        @Positive(message = "User ID must be positive")
        Long userId,

        @NotBlank(message = "Shipping address is required")
        @Size(min = 5, max = 255, message = "Shipping address must be between 5 and 255 characters")
        String shippingAddress
) {
}
