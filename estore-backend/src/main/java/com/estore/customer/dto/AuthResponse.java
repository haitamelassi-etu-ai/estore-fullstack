package com.estore.customer.dto;

import lombok.Builder;

@Builder
public record AuthResponse(
        String token,
        UserDTO user
) {
}
