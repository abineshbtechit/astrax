package com.investigation.dms.model;

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
@Document(collection = "case_timeline_events")
public class TimelineEvent {

    @Id
    private String id;

    @Indexed
    private String investigationId;

    private String eventType;

    private String title;

    private String description;

    private String actor;

    private String actorRole;

    @Indexed
    private Instant timestamp;

    private String relatedDocumentId;

    private String relatedEvidenceId;
}
