package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.auth.ChangePasswordRequest;
import com.investigation.dms.dto.auth.ForgotPasswordRequest;
import com.investigation.dms.dto.auth.LoginRequest;
import com.investigation.dms.dto.auth.LoginResponse;
import com.investigation.dms.dto.auth.RegisterRequest;
import com.investigation.dms.dto.auth.ResetPasswordRequest;
import com.investigation.dms.dto.user.UserResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @Operation(summary = "Authenticate and issue a JWT")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest http) {
        String ip = clientIp(http);
        String device = http.getHeader("User-Agent");
        return ResponseEntity.ok(ApiResponse.ok(authService.login(request, ip, device)));
    }

    @Operation(summary = "Register a user (authorized roles only)")
    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN','DEPARTMENT_ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse created = authService.register(request, SecurityUtils.currentPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(created, "User registered"));
    }

    @Operation(summary = "Get current authenticated user")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        return ResponseEntity.ok(ApiResponse.ok(authService.me(SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Change password")
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(SecurityUtils.currentPrincipal(), request);
        return ResponseEntity.ok(ApiResponse.message("Password changed"));
    }

    @Operation(summary = "Request password recovery token")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {
        String token = authService.forgotPassword(request);
        Map<String, String> data = new HashMap<>();
        // Token echoed only for development; production delivers securely via email.
        if (token != null) {
            data.put("devResetToken", token);
        }
        return ResponseEntity.ok(ApiResponse.ok(data,
                "If the email exists, a reset token has been issued"));
    }

    @Operation(summary = "Reset password using a recovery token")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.message("Password reset successful"));
    }

    private String clientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
