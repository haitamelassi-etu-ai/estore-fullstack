package com.estore.customer.service;

import com.estore.customer.dto.ProfileDTO;
import com.estore.customer.dto.UserDTO;
import com.estore.customer.entity.Profile;
import com.estore.customer.entity.User;
import com.estore.customer.repository.ProfileRepository;
import com.estore.customer.repository.UserRepository;
import com.estore.shared.exception.EmailAlreadyExistsException;
import com.estore.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public User getByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user not found"));
    }

    public UserDTO getUserById(Long userId, User authUser) {
        validateOwnership(userId, authUser);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toUserDTO(user);
    }

    public ProfileDTO getProfile(Long userId, User authUser) {
        validateOwnership(userId, authUser);
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        return toProfileDTO(profile);
    }

    @Transactional
    public ProfileDTO upsertProfile(Long userId, ProfileDTO profileDTO, User authUser) {
        validateOwnership(userId, authUser);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (profileDTO.email() != null && !profileDTO.email().isBlank() && !profileDTO.email().equalsIgnoreCase(user.getEmail())) {
            if (userRepository.existsByEmail(profileDTO.email().trim().toLowerCase())) {
                throw new EmailAlreadyExistsException("Email already exists");
            }
            user.setEmail(profileDTO.email().trim().toLowerCase());
        }
        if (profileDTO.firstName() != null && !profileDTO.firstName().isBlank()) {
            user.setFirstName(profileDTO.firstName().trim());
        }
        if (profileDTO.lastName() != null && !profileDTO.lastName().isBlank()) {
            user.setLastName(profileDTO.lastName().trim());
        }

        Profile profile = profileRepository.findByUserId(userId).orElseGet(() -> Profile.builder().user(user).build());
        profile.setPhone(profileDTO.phone());
        profile.setAddress(profileDTO.address());
        profile.setCity(profileDTO.city());
        profile.setCountry(profileDTO.country());

        Profile saved = profileRepository.save(profile);
        userRepository.save(user);
        return toProfileDTO(saved);
    }

    private void validateOwnership(Long targetUserId, User authUser) {
        boolean isAdmin = "ROLE_ADMIN".equalsIgnoreCase(authUser.getRole()) || "ADMIN".equalsIgnoreCase(authUser.getRole());
        if (!isAdmin && !authUser.getId().equals(targetUserId)) {
            throw new AccessDeniedException("You cannot access another user's data");
        }
    }

    public UserDTO toUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .role(user.getRole())
                .profile(user.getProfile() == null ? null : toProfileDTO(user.getProfile()))
                .build();
    }

    public ProfileDTO toProfileDTO(Profile profile) {
        return ProfileDTO.builder()
                .id(profile.getId())
                .firstName(profile.getUser() != null ? profile.getUser().getFirstName() : null)
                .lastName(profile.getUser() != null ? profile.getUser().getLastName() : null)
                .email(profile.getUser() != null ? profile.getUser().getEmail() : null)
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .city(profile.getCity())
                .country(profile.getCountry())
                .userId(profile.getUser() != null ? profile.getUser().getId() : null)
                .build();
    }
}
