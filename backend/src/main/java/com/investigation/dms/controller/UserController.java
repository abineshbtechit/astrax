package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.auth.RegisterRequest;
import com.investigation.dms.dto.user.UpdateProfileRequest;
import com.investigation.dms.dto.user.UpdateUserRequest;
import com.investigation.dms.dto.user.UserResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.AuthService;
import com.investigation.dms.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Users & Profile")
@RestController
@RequestMapping("/api")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @Operation(summary = "List all users")
    @GetMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_ADMIN','AUDITOR')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> listUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.listUsers()));
    }

    @Operation(summary = "Create a user (administrative)")
    @PostMapping("/users")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody RegisterRequest request) {
        UserResponse created = authService.register(request, SecurityUtils.currentPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "User created"));
    }

    @Operation(summary = "Get a user by id")
    @GetMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_ADMIN','AUDITOR')")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUser(id)));
    }

    @Operation(summary = "Update a user or its active state")
    @PutMapping("/users/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable String id,
                                                                @Valid @RequestBody UpdateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.updateUser(id, request, SecurityUtils.currentPrincipal()), "User updated"));
    }

    @Operation(summary = "Get own profile")
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> profile() {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.getUser(SecurityUtils.currentUserId())));
    }

    @Operation(summary = "Update own profile")
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                userService.updateProfile(SecurityUtils.currentPrincipal(), request), "Profile updated"));
    }
}
