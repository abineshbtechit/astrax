package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.misc.AuditChainVerifyResponse;
import com.investigation.dms.dto.misc.AuditLogResponse;
import com.investigation.dms.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Audit Logs")
@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasAnyRole('ADMIN','AUDITOR','COURT_OFFICER')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @Operation(summary = "List audit records")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(
                auditService.all().stream().map(auditService::toResponse).toList()));
    }

    @Operation(summary = "Verify the audit chain integrity")
    @PostMapping("/verify-chain")
    public ResponseEntity<ApiResponse<AuditChainVerifyResponse>> verifyChain() {
        return ResponseEntity.ok(ApiResponse.ok(auditService.verifyChain()));
    }
}
