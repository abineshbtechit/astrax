package com.investigation.dms.model;

import com.investigation.dms.common.enums.Permission;
import com.investigation.dms.common.enums.RequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "access_requests")
public class AccessRequest {

    @Id
    private String id;

    @Indexed
    private String documentId;

    @Indexed
    private String requesterId;

    @Builder.Default
    private Set<Permission> requestedPermissions = new HashSet<>();

    private String reason;

    @Indexed
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    private String reviewerId;
    private String decisionNote;
    private Instant decidedAt;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
