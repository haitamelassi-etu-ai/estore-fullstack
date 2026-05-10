package com.estore.shopping.dto;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record CartDTO(
        Long id,
        Long userId,
        List<CartItemDTO> items,
        Integer itemCount,
        BigDecimal totalAmount,
        LocalDateTime createdAt
) {
}
