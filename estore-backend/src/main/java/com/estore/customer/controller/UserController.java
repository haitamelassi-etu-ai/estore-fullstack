package com.estore.customer.controller;

import com.estore.customer.dto.ProfileDTO;
import com.estore.customer.dto.UserDTO;
import com.estore.customer.entity.User;
import com.estore.customer.service.UserService;
import com.estore.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDTO>> getUser(@PathVariable Long userId, Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(userId, authUser)));
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<ProfileDTO>> getProfile(@PathVariable Long userId, Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(userService.getProfile(userId, authUser)));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<ApiResponse<ProfileDTO>> updateProfile(@PathVariable Long userId,
                                                                 @Valid @RequestBody ProfileDTO profileDTO,
                                                                 Authentication authentication) {
        User authUser = userService.getByEmail(authentication.getName());
        ProfileDTO updated = userService.upsertProfile(userId, profileDTO, authUser);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }
}
