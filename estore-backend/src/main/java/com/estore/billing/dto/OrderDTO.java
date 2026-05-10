package com.estore.billing.dto;

import com.estore.billing.entity.OrderStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Builder
public record OrderDTO(
        Long id,
        Long userId,
        List<OrderItemDTO> items,
        BigDecimal totalAmount,
        String shippingAddress,
        OrderStatus status,
        LocalDateTime orderDate
) {
}
