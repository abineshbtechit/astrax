package com.investigation.dms.service;

import com.investigation.dms.common.enums.AlertSeverity;
import com.investigation.dms.common.enums.AlertType;
import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.exception.BadRequestException;
import com.investigation.dms.common.exception.ConflictException;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.auth.ChangePasswordRequest;
import com.investigation.dms.dto.auth.ForgotPasswordRequest;
import com.investigation.dms.dto.auth.LoginRequest;
import com.investigation.dms.dto.auth.LoginResponse;
import com.investigation.dms.dto.auth.RegisterRequest;
import com.investigation.dms.dto.auth.ResetPasswordRequest;
import com.investigation.dms.dto.user.UserResponse;
import com.investigation.dms.config.JwtProperties;
import com.investigation.dms.model.User;
import com.investigation.dms.repository.UserRepository;
import com.investigation.dms.security.JwtService;
import com.investigation.dms.security.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Authentication, registration and password management (FR-AUTH-001..006).
 */
@Slf4j
@Service
public class AuthService {

    private static final int MAX_FAILED_LOGINS = 5;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuditService auditService;
    private final SecurityAlertService securityAlertService;
    private final UserService userService;

    // In-memory failed-login tracking for brute-force detection.
    private final Map<String, Integer> failedLogins = new ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
                       JwtProperties jwtProperties, AuditService auditService,
                       SecurityAlertService securityAlertService, UserService userService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.auditService = auditService;
        this.securityAlertService = securityAlertService;
        this.userService = userService;
    }

    public LoginResponse login(LoginRequest request, String ip, String device) {
        User user = userRepository.findByUsername(request.getUsername())
                .or(() -> userRepository.findByEmail(request.getUsername()))
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            registerFailedLogin(request.getUsername(), ip);
            auditService.record(request.getUsername(), null, AuditAction.LOGIN_FAILED, null, null, null,
                    "FAILED", "Failed login attempt", ip, device);
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!user.isActive()) {
            auditService.record(user.getUsername(), null, AuditAction.LOGIN_FAILED, null, null, null,
                    "FAILED", "Login attempt on deactivated account", ip, device);
            throw new BadRequestException("Account is deactivated");
        }

        failedLogins.remove(request.getUsername());

        String token = jwtService.generateToken(
                user.getId(),
                user.getUsername(),
                user.getRoles().stream().map(Enum::name).toList(),
                user.getDepartmentId());

        auditService.record(user.getUsername(), firstRole(user), AuditAction.LOGIN, null, null, null,
                "SUCCESS", "User logged in", ip, device);

        return LoginResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresInMs(jwtProperties.getExpirationMs())
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .roles(user.getRoles().stream().map(Enum::name).toList())
                .departmentId(user.getDepartmentId())
                .build();
    }

    private void registerFailedLogin(String username, String ip) {
        int count = failedLogins.merge(username, 1, Integer::sum);
        if (count >= MAX_FAILED_LOGINS) {
            securityAlertService.raise(AlertType.MULTIPLE_FAILED_LOGINS, AlertSeverity.HIGH, username,
                    "Multiple failed login attempts (" + count + ") for '" + username + "' from " + ip);
            failedLogins.put(username, 0);
        }
    }

    public UserResponse register(RegisterRequest request, UserPrincipal creator) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ConflictException("Username already in use");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .badgeNumber(request.getBadgeNumber())
                .departmentId(request.getDepartmentId())
                .roles(request.getRoles())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .build();
        user = userRepository.save(user);

        String actor = creator != null ? creator.getUsername() : "SYSTEM";
        auditService.record(actor, null, AuditAction.USER_CREATED, null, null, null,
                "SUCCESS", "Registered user " + user.getUsername(), null, null);

        return userService.toResponse(user);
    }

    public UserResponse me(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userService.toResponse(user);
    }

    public void changePassword(UserPrincipal principal, ChangePasswordRequest request) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        auditService.record(user.getUsername(), null, AuditAction.USER_UPDATED, null, null, null,
                "SUCCESS", "Password changed", null, null);
    }

    /**
     * Issues a password reset token. To avoid user enumeration, always returns
     * silently; only when the email exists is a token generated. In production the
     * token would be delivered via a secure email channel.
     */
    public String forgotPassword(ForgotPasswordRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    String token = UUID.randomUUID().toString();
                    user.setResetToken(token);
                    user.setResetTokenExpiry(Instant.now().plus(1, ChronoUnit.HOURS));
                    userRepository.save(user);
                    log.info("Password reset token issued for {}", user.getEmail());
                    // Returned here only for development; production delivers via email.
                    return token;
                })
                .orElse(null);
    }

    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset token"));
        if (user.getResetTokenExpiry() == null || Instant.now().isAfter(user.getResetTokenExpiry())) {
            throw new BadRequestException("Reset token has expired");
        }
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);
        auditService.record(user.getUsername(), null, AuditAction.USER_UPDATED, null, null, null,
                "SUCCESS", "Password reset via token", null, null);
    }

    private String firstRole(User user) {
        return user.getRoles().isEmpty() ? null : user.getRoles().iterator().next().name();
    }
}
