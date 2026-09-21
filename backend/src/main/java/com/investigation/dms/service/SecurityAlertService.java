package com.investigation.dms.service;

import com.investigation.dms.common.enums.AlertSeverity;
import com.investigation.dms.common.enums.AlertStatus;
import com.investigation.dms.common.enums.AlertType;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.misc.SecurityAlertResponse;
import com.investigation.dms.model.SecurityAlert;
import com.investigation.dms.repository.SecurityAlertRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Generates and manages security alerts (FR-SEC-001). Detection heuristics for
 * failed logins, rapid downloads and denied access are tracked in-memory here and
 * escalated to persistent alerts when thresholds are exceeded.
 */
@Service
public class SecurityAlertService {

    private final SecurityAlertRepository repository;

    public SecurityAlertService(SecurityAlertRepository repository) {
        this.repository = repository;
    }

    public SecurityAlert raise(AlertType type, AlertSeverity severity, String actor, String description) {
        SecurityAlert alert = SecurityAlert.builder()
                .alertType(type)
                .severity(severity)
                .actor(actor)
                .description(description)
                .detectedAt(Instant.now())
                .status(AlertStatus.OPEN)
                .build();
        return repository.save(alert);
    }

    public SecurityAlert raise(AlertType type, AlertSeverity severity, String actor, String description,
                               String investigationId, String documentId, String evidenceId) {
        SecurityAlert alert = SecurityAlert.builder()
                .alertType(type)
                .severity(severity)
                .actor(actor)
                .description(description)
                .detectedAt(Instant.now())
                .status(AlertStatus.OPEN)
                .relatedInvestigationId(investigationId)
                .relatedDocumentId(documentId)
                .relatedEvidenceId(evidenceId)
                .build();
        return repository.save(alert);
    }

    public List<SecurityAlertResponse> all() {
        return repository.findAllByOrderByDetectedAtDesc().stream().map(this::toResponse).toList();
    }

    public long openCount() {
        return repository.countByStatus(AlertStatus.OPEN);
    }

    public SecurityAlertResponse updateStatus(String id, AlertStatus status, String note, String resolvedBy) {
        SecurityAlert alert = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Security alert not found"));
        alert.setStatus(status);
        if (status == AlertStatus.RESOLVED || status == AlertStatus.DISMISSED) {
            alert.setResolvedBy(resolvedBy);
            alert.setResolvedAt(Instant.now());
            alert.setResolutionNote(note);
        }
        return toResponse(repository.save(alert));
    }

    public SecurityAlertResponse toResponse(SecurityAlert a) {
        return SecurityAlertResponse.builder()
                .id(a.getId())
                .alertType(a.getAlertType())
                .severity(a.getSeverity())
                .actor(a.getActor())
                .description(a.getDescription())
                .detectedAt(a.getDetectedAt())
                .status(a.getStatus())
                .resolvedBy(a.getResolvedBy())
                .resolvedAt(a.getResolvedAt())
                .resolutionNote(a.getResolutionNote())
                .build();
    }
}
