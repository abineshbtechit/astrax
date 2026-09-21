package com.investigation.dms.dto.misc;

import com.investigation.dms.common.enums.AlertSeverity;
import com.investigation.dms.common.enums.AlertStatus;
import com.investigation.dms.common.enums.AlertType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SecurityAlertResponse {
    private String id;
    private AlertType alertType;
    private AlertSeverity severity;
    private String actor;
    private String description;
    private Instant detectedAt;
    private AlertStatus status;
    private String resolvedBy;
    private Instant resolvedAt;
    private String resolutionNote;
}
