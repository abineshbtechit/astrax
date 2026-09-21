package com.investigation.dms.model;

import com.investigation.dms.common.enums.AlertSeverity;
import com.investigation.dms.common.enums.AlertStatus;
import com.investigation.dms.common.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "security_alerts")
public class SecurityAlert {

    @Id
    private String id;

    @Indexed
    private AlertType alertType;

    private AlertSeverity severity;

    private String actor;

    private String description;

    @Indexed
    private Instant detectedAt;

    @Indexed
    @Builder.Default
    private AlertStatus status = AlertStatus.OPEN;

    private String relatedInvestigationId;
    private String relatedDocumentId;
    private String relatedEvidenceId;

    private String resolvedBy;
    private Instant resolvedAt;
    private String resolutionNote;
}
