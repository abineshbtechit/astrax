package com.investigation.dms.service;

import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.exception.ConflictException;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.user.UpdateProfileRequest;
import com.investigation.dms.dto.user.UpdateUserRequest;
import com.investigation.dms.dto.user.UserResponse;
import com.investigation.dms.model.User;
import com.investigation.dms.repository.UserRepository;
import com.investigation.dms.security.UserPrincipal;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public UserService(UserRepository userRepository, @Lazy AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public List<UserResponse> listUsers() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse getUser(String id) {
        return userRepository.findById(id).map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse updateUser(String id, UpdateUserRequest request, UserPrincipal actor) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }

        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName());
        }
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail());
        }
        if (request.getBadgeNumber() != null) {
            user.setBadgeNumber(request.getBadgeNumber());
        }
        if (request.getDepartmentId() != null) {
            user.setDepartmentId(request.getDepartmentId());
        }
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            user.setRoles(request.getRoles());
        }
        boolean statusChanged = false;
        if (request.getActive() != null && request.getActive() != user.isActive()) {
            user.setActive(request.getActive());
            statusChanged = true;
        }

        user = userRepository.save(user);

        AuditAction action = statusChanged && !user.isActive()
                ? AuditAction.USER_DISABLED : AuditAction.USER_UPDATED;
        auditService.record(actor.getUsername(), null, action, null, null, null,
                "SUCCESS", "Updated user " + user.getUsername(), null, null);

        return toResponse(user);
    }

    public UserResponse updateProfile(UserPrincipal principal, UpdateProfileRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (StringUtils.hasText(request.getEmail()) && !request.getEmail().equals(user.getEmail())
                && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }
        if (StringUtils.hasText(request.getFullName())) {
            user.setFullName(request.getFullName());
        }
        if (StringUtils.hasText(request.getEmail())) {
            user.setEmail(request.getEmail());
        }
        if (request.getBadgeNumber() != null) {
            user.setBadgeNumber(request.getBadgeNumber());
        }
        user = userRepository.save(user);
        return toResponse(user);
    }

    public UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .badgeNumber(user.getBadgeNumber())
                .roles(user.getRoles())
                .departmentId(user.getDepartmentId())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
