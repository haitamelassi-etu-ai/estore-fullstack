package com.estore.customer.dto;

import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import lombok.Builder;

@Builder
public record ProfileDTO(
        Long id,
        @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
        String firstName,
        @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
        String lastName,
        @Email(message = "Email is invalid")
        String email,

        @Size(max = 30, message = "Phone must not exceed 30 characters")
        String phone,

        @Size(max = 255, message = "Address must not exceed 255 characters")
        String address,

        @Size(max = 100, message = "City must not exceed 100 characters")
        String city,

        @Size(max = 100, message = "Country must not exceed 100 characters")
        String country,
        Long userId
) {
}
