package com.investigation.dms.dto.investigation;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TimelineEventRequest {
    @NotBlank
    private String eventType;

    @NotBlank
    private String title;

    private String description;

    private String relatedDocumentId;

    private String relatedEvidenceId;
}
