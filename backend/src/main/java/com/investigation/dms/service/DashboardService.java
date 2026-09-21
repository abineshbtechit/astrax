package com.investigation.dms.service;

import com.investigation.dms.common.enums.CaseStatus;
import com.investigation.dms.dto.misc.DashboardStats;
import com.investigation.dms.model.DocumentEntity;
import com.investigation.dms.model.Investigation;
import com.investigation.dms.repository.DocumentRepository;
import com.investigation.dms.repository.EvidenceRepository;
import com.investigation.dms.repository.InvestigationRepository;
import com.investigation.dms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Dashboard statistics scoped to what the caller can access (FR-DASH-001).
 */
@Service
public class DashboardService {

    private final InvestigationRepository investigationRepository;
    private final DocumentRepository documentRepository;
    private final EvidenceRepository evidenceRepository;
    private final AccessControlService accessControl;
    private final SecurityAlertService securityAlertService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public DashboardService(InvestigationRepository investigationRepository,
                            DocumentRepository documentRepository,
                            EvidenceRepository evidenceRepository,
                            AccessControlService accessControl,
                            SecurityAlertService securityAlertService,
                            NotificationService notificationService,
                            AuditService auditService) {
        this.investigationRepository = investigationRepository;
        this.documentRepository = documentRepository;
        this.evidenceRepository = evidenceRepository;
        this.accessControl = accessControl;
        this.securityAlertService = securityAlertService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public DashboardStats stats(UserPrincipal principal) {
        List<Investigation> visibleCases = investigationRepository.findAll().stream()
                .filter(inv -> accessControl.canViewCase(principal, inv))
                .toList();

        Map<String, Long> casesByStatus = visibleCases.stream()
                .collect(Collectors.groupingBy(i -> i.getStatus().name(), Collectors.counting()));

        long activeInvestigations = visibleCases.stream()
                .filter(i -> i.getStatus() == CaseStatus.UNDER_INVESTIGATION).count();
        long pendingReviews = visibleCases.stream()
                .filter(i -> i.getStatus() == CaseStatus.PENDING_REVIEW).count();

        List<DocumentEntity> visibleDocs = documentRepository.findAll().stream()
                .filter(d -> accessControl.hasDocumentPermission(principal, d,
                        com.investigation.dms.common.enums.Permission.VIEW))
                .toList();

        Map<String, Long> docsByType = visibleDocs.stream()
                .filter(d -> d.getType() != null)
                .collect(Collectors.groupingBy(d -> d.getType().name(), Collectors.counting()));

        long evidenceCount = evidenceRepository.findAll().stream()
                .filter(e -> investigationRepository.findById(e.getInvestigationId())
                        .map(inv -> accessControl.canViewCase(principal, inv)).orElse(false))
                .count();

        List<DashboardStats.RecentActivity> recent = auditService.all().stream()
                .sorted((a, b) -> Long.compare(b.getSequence(), a.getSequence()))
                .limit(10)
                .map(a -> DashboardStats.RecentActivity.builder()
                        .action(a.getAction() == null ? null : a.getAction().name())
                        .actor(a.getActor())
                        .description(a.getDescription())
                        .timestamp(a.getTimestamp() == null ? null : a.getTimestamp().toString())
                        .build())
                .toList();

        return DashboardStats.builder()
                .totalCases(visibleCases.size())
                .activeInvestigations(activeInvestigations)
                .pendingReviews(pendingReviews)
                .totalDocuments(visibleDocs.size())
                .totalEvidence(evidenceCount)
                .openSecurityAlerts(securityAlertService.openCount())
                .unreadNotifications(notificationService.unreadCount(principal.getId()))
                .casesByStatus(new LinkedHashMap<>(casesByStatus))
                .documentsByType(new LinkedHashMap<>(docsByType))
                .recentActivities(recent)
                .build();
    }
}
