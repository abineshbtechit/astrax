package com.investigation.dms.dto.share;

import com.investigation.dms.common.enums.GranteeType;
import com.investigation.dms.common.enums.Permission;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.Set;

@Data
public class ShareRequest {
    @NotNull
    private GranteeType granteeType;

    @NotNull
    private String granteeId;

    @NotEmpty
    private Set<Permission> permissions;

    private String purpose;

    private Instant startAt;

    private Instant expiresAt;
}
