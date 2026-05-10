package com.estore.shopping.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record CartItemDTO(
        Long id,
        Long productId,
        String productName,
        String imageUrl,
        Integer quantity,
        BigDecimal unitPrice,
        BigDecimal lineTotal
) {
}
