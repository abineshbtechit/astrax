package com.investigation.dms.dto.share;

import lombok.Data;

@Data
public class DecisionRequest {
    private String note;
    // For approvals: optional expiry for the resulting grant.
    private java.time.Instant expiresAt;
}
