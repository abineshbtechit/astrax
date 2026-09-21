package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.misc.NotificationResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Notifications")
@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Operation(summary = "List current user's notifications")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(
                notificationService.forUser(SecurityUtils.currentUserId())));
    }

    @Operation(summary = "Mark a notification read")
    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable String id) {
        notificationService.markRead(id, SecurityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.message("Marked read"));
    }

    @Operation(summary = "Mark all notifications read")
    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead(SecurityUtils.currentUserId());
        return ResponseEntity.ok(ApiResponse.message("All marked read"));
    }
}
