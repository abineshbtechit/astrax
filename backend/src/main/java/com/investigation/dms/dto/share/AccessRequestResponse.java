package com.investigation.dms.dto.share;

import com.investigation.dms.common.enums.Permission;
import com.investigation.dms.common.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccessRequestResponse {
    private String id;
    private String documentId;
    private String requesterId;
    private Set<Permission> requestedPermissions;
    private String reason;
    private RequestStatus status;
    private String reviewerId;
    private String decisionNote;
    private Instant decidedAt;
    private Instant createdAt;
}
