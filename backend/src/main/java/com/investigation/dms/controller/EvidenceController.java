package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.evidence.CreateEvidenceRequest;
import com.investigation.dms.dto.evidence.EvidenceResponse;
import com.investigation.dms.dto.evidence.ReceiveRequest;
import com.investigation.dms.dto.evidence.TransferRequest;
import com.investigation.dms.dto.evidence.TransferResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.EvidenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Evidence & Chain of Custody")
@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final EvidenceService evidenceService;

    public EvidenceController(EvidenceService evidenceService) {
        this.evidenceService = evidenceService;
    }

    @Operation(summary = "List evidence (optionally by investigation)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<EvidenceResponse>>> list(
            @RequestParam(required = false) String investigationId) {
        return ResponseEntity.ok(ApiResponse.ok(
                evidenceService.list(investigationId, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Register evidence")
    @PostMapping
    public ResponseEntity<ApiResponse<EvidenceResponse>> create(@Valid @RequestBody CreateEvidenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                evidenceService.create(request, SecurityUtils.currentPrincipal()), "Evidence registered"));
    }

    @Operation(summary = "Evidence detail")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EvidenceResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                evidenceService.get(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Transfer custody")
    @PostMapping("/{id}/transfer")
    public ResponseEntity<ApiResponse<TransferResponse>> transfer(
            @PathVariable String id, @Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                evidenceService.transfer(id, request, SecurityUtils.currentPrincipal()), "Transfer initiated"));
    }

    @Operation(summary = "Receive custody")
    @PostMapping("/{id}/receive")
    public ResponseEntity<ApiResponse<TransferResponse>> receive(
            @PathVariable String id, @RequestBody(required = false) ReceiveRequest request) {
        ReceiveRequest req = request == null ? new ReceiveRequest() : request;
        return ResponseEntity.ok(ApiResponse.ok(
                evidenceService.receive(id, req, SecurityUtils.currentPrincipal()), "Custody received"));
    }

    @Operation(summary = "Chain of custody")
    @GetMapping("/{id}/chain")
    public ResponseEntity<ApiResponse<List<TransferResponse>>> chain(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                evidenceService.chain(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Verify evidence integrity")
    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<EvidenceResponse>> verify(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                evidenceService.verify(id, SecurityUtils.currentPrincipal())));
    }
}
