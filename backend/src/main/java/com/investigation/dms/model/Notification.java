package com.investigation.dms.model;

import com.investigation.dms.common.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String title;

    private String message;

    private NotificationType type;

    @Builder.Default
    private boolean read = false;

    private String actionUrl;

    private String relatedInvestigationId;
    private String relatedDocumentId;
    private String relatedEvidenceId;

    @CreatedDate
    private Instant createdAt;
}
