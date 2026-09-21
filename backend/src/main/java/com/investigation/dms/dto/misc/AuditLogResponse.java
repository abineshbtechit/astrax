package com.investigation.dms.dto.misc;

import com.investigation.dms.common.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private String id;
    private String actor;
    private String actorRole;
    private AuditAction action;
    private String investigationId;
    private String documentId;
    private String evidenceId;
    private String result;
    private String description;
    private String previousHash;
    private String currentHash;
    private long sequence;
    private Instant timestamp;
}
