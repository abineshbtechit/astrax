package com.investigation.dms.model;

import com.investigation.dms.common.enums.AuditAction;
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
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    @Indexed
    private String actor;

    private String actorRole;

    @Indexed
    private AuditAction action;

    @Indexed
    private String investigationId;

    @Indexed
    private String documentId;

    private String evidenceId;

    private String ipAddress;

    private String device;

    private String result;

    private String description;

    private String previousHash;

    private String currentHash;

    @Indexed
    private Instant timestamp;

    // Monotonic sequence to order the audit chain deterministically
    @Indexed(unique = true)
    private long sequence;
}
