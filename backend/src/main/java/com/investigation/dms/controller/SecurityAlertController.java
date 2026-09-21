package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.misc.AlertStatusRequest;
import com.investigation.dms.dto.misc.SecurityAlertResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.SecurityAlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Security Alerts")
@RestController
@RequestMapping("/api/security")
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR')")
public class SecurityAlertController {

    private final SecurityAlertService securityAlertService;

    public SecurityAlertController(SecurityAlertService securityAlertService) {
        this.securityAlertService = securityAlertService;
    }

    @Operation(summary = "List security alerts")
    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<SecurityAlertResponse>>> alerts() {
        return ResponseEntity.ok(ApiResponse.ok(securityAlertService.all()));
    }

    @Operation(summary = "Update a security alert status")
    @PutMapping("/alerts/{id}/status")
    public ResponseEntity<ApiResponse<SecurityAlertResponse>> updateStatus(
            @PathVariable String id, @Valid @RequestBody AlertStatusRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(securityAlertService.updateStatus(
                id, request.getStatus(), request.getNote(), SecurityUtils.currentPrincipal().getUsername()),
                "Alert updated"));
    }
}
