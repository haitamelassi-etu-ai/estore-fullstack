package com.estore.catalog.dto;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record ProductDTO(
        Long id,
        String name,
        String description,
        BigDecimal price,
        BigDecimal oldPrice,
        String imageUrl,
        String icon,
        String badge,
        Double rating,
        Integer reviewCount,
        CategoryDTO category,
        Integer inventoryQuantity
) {
}
