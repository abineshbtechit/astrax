package com.investigation.dms.service;

import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.enums.ReportStatus;
import com.investigation.dms.common.enums.ReportType;
import com.investigation.dms.dto.misc.ReportResponse;
import com.investigation.dms.model.Investigation;
import com.investigation.dms.model.Report;
import com.investigation.dms.repository.DocumentRepository;
import com.investigation.dms.repository.EvidenceRepository;
import com.investigation.dms.repository.InvestigationMemberRepository;
import com.investigation.dms.repository.ReportRepository;
import com.investigation.dms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Generates structured investigation/case reports (FR-REPORT-001).
 */
@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final DocumentRepository documentRepository;
    private final EvidenceRepository evidenceRepository;
    private final InvestigationMemberRepository memberRepository;
    private final InvestigationService investigationService;
    private final AccessControlService accessControl;
    private final AuditService auditService;

    public ReportService(ReportRepository reportRepository,
                         DocumentRepository documentRepository,
                         EvidenceRepository evidenceRepository,
                         InvestigationMemberRepository memberRepository,
                         InvestigationService investigationService,
                         AccessControlService accessControl,
                         AuditService auditService) {
        this.reportRepository = reportRepository;
        this.documentRepository = documentRepository;
        this.evidenceRepository = evidenceRepository;
        this.memberRepository = memberRepository;
        this.investigationService = investigationService;
        this.accessControl = accessControl;
        this.auditService = auditService;
    }

    public ReportResponse generateCaseReport(String investigationId, UserPrincipal principal) {
        Investigation inv = investigationService.require(investigationId);
        accessControl.requireCaseView(principal, inv);

        Map<String, Object> content = new LinkedHashMap<>();
        content.put("caseNumber", inv.getCaseNumber());
        content.put("title", inv.getTitle());
        content.put("crimeType", inv.getCrimeType());
        content.put("status", inv.getStatus());
        content.put("priority", inv.getPriority());
        content.put("location", inv.getLocation());
        content.put("ownerDepartmentId", inv.getOwnerDepartmentId());
        content.put("investigatingOfficer", inv.getInvestigatingOfficer());
        content.put("participatingDepartments", inv.getParticipatingDepartmentIds());
        content.put("documentCount", documentRepository.countByInvestigationId(investigationId));
        content.put("evidenceCount", evidenceRepository.findByInvestigationId(investigationId).size());
        content.put("memberCount", memberRepository.findByInvestigationId(investigationId).size());
        content.put("statusHistory", inv.getStatusHistory());
        content.put("generatedAt", java.time.Instant.now().toString());

        Report report = Report.builder()
                .investigationId(investigationId)
                .reportType(ReportType.CASE_SUMMARY)
                .generatedBy(principal.getId())
                .status(ReportStatus.COMPLETED)
                .content(content)
                .outputReference("report:" + inv.getCaseNumber())
                .build();
        report = reportRepository.save(report);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.REPORT_GENERATED,
                investigationId, null, null, "SUCCESS", "Generated case report", null, null);

        return toResponse(report);
    }

    public ReportResponse toResponse(Report r) {
        return ReportResponse.builder()
                .id(r.getId())
                .investigationId(r.getInvestigationId())
                .reportType(r.getReportType())
                .generatedBy(r.getGeneratedBy())
                .status(r.getStatus())
                .content(r.getContent())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private String firstRole(UserPrincipal principal) {
        return principal.getRoleNames().isEmpty() ? null : principal.getRoleNames().get(0);
    }
}
