package com.estore.catalog.dto;

import lombok.Builder;

@Builder
public record CategoryDTO(
        Long id,
        String name,
        String description
) {
}
