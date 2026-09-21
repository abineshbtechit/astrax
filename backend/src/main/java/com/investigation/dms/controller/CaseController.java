package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.investigation.AddMemberRequest;
import com.investigation.dms.dto.investigation.CaseResponse;
import com.investigation.dms.dto.investigation.CreateCaseRequest;
import com.investigation.dms.dto.investigation.MemberResponse;
import com.investigation.dms.dto.investigation.TimelineEventRequest;
import com.investigation.dms.dto.investigation.UpdateCaseRequest;
import com.investigation.dms.dto.misc.RelationshipResponse;
import com.investigation.dms.dto.misc.ReportResponse;
import com.investigation.dms.dto.misc.TimelineEventResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.InvestigationService;
import com.investigation.dms.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Investigations / Cases")
@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final InvestigationService investigationService;
    private final ReportService reportService;

    public CaseController(InvestigationService investigationService, ReportService reportService) {
        this.investigationService = investigationService;
        this.reportService = reportService;
    }

    @Operation(summary = "List permitted investigations")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CaseResponse>>> list() {
        return ResponseEntity.ok(ApiResponse.ok(investigationService.list(SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Create an investigation")
    @PostMapping
    public ResponseEntity<ApiResponse<CaseResponse>> create(@Valid @RequestBody CreateCaseRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                investigationService.create(request, SecurityUtils.currentPrincipal()), "Investigation created"));
    }

    @Operation(summary = "Get an investigation")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CaseResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                investigationService.get(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Update an investigation")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CaseResponse>> update(@PathVariable String id,
                                                            @Valid @RequestBody UpdateCaseRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                investigationService.update(id, request, SecurityUtils.currentPrincipal()), "Investigation updated"));
    }

    @Operation(summary = "Assign a member / department")
    @PostMapping("/{id}/members")
    public ResponseEntity<ApiResponse<MemberResponse>> addMember(@PathVariable String id,
                                                                 @Valid @RequestBody AddMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                investigationService.addMember(id, request, SecurityUtils.currentPrincipal()), "Member assigned"));
    }

    @Operation(summary = "List members")
    @GetMapping("/{id}/members")
    public ResponseEntity<ApiResponse<List<MemberResponse>>> members(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                investigationService.members(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Get timeline")
    @GetMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<List<TimelineEventResponse>>> timeline(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                investigationService.timeline(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Add a timeline event")
    @PostMapping("/{id}/timeline")
    public ResponseEntity<ApiResponse<TimelineEventResponse>> addTimeline(
            @PathVariable String id, @Valid @RequestBody TimelineEventRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                investigationService.addTimelineEvent(id, request, SecurityUtils.currentPrincipal()), "Event added"));
    }

    @Operation(summary = "Get relationship graph")
    @GetMapping("/{id}/relationships")
    public ResponseEntity<ApiResponse<RelationshipResponse>> relationships(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                investigationService.relationships(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Generate / get case report")
    @GetMapping("/{id}/report")
    public ResponseEntity<ApiResponse<ReportResponse>> report(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                reportService.generateCaseReport(id, SecurityUtils.currentPrincipal())));
    }
}
