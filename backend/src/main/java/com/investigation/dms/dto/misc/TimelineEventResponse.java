package com.investigation.dms.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TimelineEventResponse {
    private String id;
    private String investigationId;
    private String eventType;
    private String title;
    private String description;
    private String actor;
    private String actorRole;
    private Instant timestamp;
    private String relatedDocumentId;
    private String relatedEvidenceId;
}
