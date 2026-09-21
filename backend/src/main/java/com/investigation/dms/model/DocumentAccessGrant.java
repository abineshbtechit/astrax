package com.investigation.dms.model;

import com.investigation.dms.common.enums.GrantStatus;
import com.investigation.dms.common.enums.GranteeType;
import com.investigation.dms.common.enums.Permission;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_access_grants")
public class DocumentAccessGrant {

    @Id
    private String id;

    @Indexed
    private String documentId;

    private GranteeType granteeType;

    @Indexed
    private String granteeId;

    @Builder.Default
    private Set<Permission> permissions = new HashSet<>();

    private String purpose;

    private Instant startAt;

    private Instant expiresAt;

    @Indexed
    @Builder.Default
    private GrantStatus status = GrantStatus.ACTIVE;

    private String grantedBy;
    private String approvedBy;
    private String revokedBy;
    private Instant revokedAt;

    @CreatedDate
    private Instant createdAt;
}
