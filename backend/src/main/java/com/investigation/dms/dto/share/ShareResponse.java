package com.investigation.dms.dto.share;

import com.investigation.dms.common.enums.GrantStatus;
import com.investigation.dms.common.enums.GranteeType;
import com.investigation.dms.common.enums.Permission;
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
public class ShareResponse {
    private String id;
    private String documentId;
    private GranteeType granteeType;
    private String granteeId;
    private Set<Permission> permissions;
    private String purpose;
    private Instant startAt;
    private Instant expiresAt;
    private GrantStatus status;
    private String grantedBy;
    private String approvedBy;
    private Instant createdAt;
}
