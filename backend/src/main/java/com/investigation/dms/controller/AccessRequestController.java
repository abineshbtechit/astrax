package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.share.AccessRequestDto;
import com.investigation.dms.dto.share.AccessRequestResponse;
import com.investigation.dms.dto.share.DecisionRequest;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Access Requests")
@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    private final ShareService shareService;

    public AccessRequestController(ShareService shareService) {
        this.shareService = shareService;
    }

    @Operation(summary = "Request access to a document")
    @PostMapping
    public ResponseEntity<ApiResponse<AccessRequestResponse>> request(@Valid @RequestBody AccessRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                shareService.requestAccess(dto, SecurityUtils.currentPrincipal()), "Access requested"));
    }

    @Operation(summary = "Approve an access request")
    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<AccessRequestResponse>> approve(
            @PathVariable String id, @RequestBody(required = false) DecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.ok(
                shareService.approveRequest(id, decision, SecurityUtils.currentPrincipal()), "Access approved"));
    }

    @Operation(summary = "Reject an access request")
    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<AccessRequestResponse>> reject(
            @PathVariable String id, @RequestBody(required = false) DecisionRequest decision) {
        return ResponseEntity.ok(ApiResponse.ok(
                shareService.rejectRequest(id, decision, SecurityUtils.currentPrincipal()), "Access rejected"));
    }
}
