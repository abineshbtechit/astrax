package com.investigation.dms.model;

import com.investigation.dms.common.enums.EvidenceStatus;
import com.investigation.dms.common.enums.TamperState;
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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "evidence")
public class Evidence {

    @Id
    private String id;

    @Indexed(unique = true)
    private String evidenceId;

    @Indexed
    private String investigationId;

    private String type;

    private String description;

    private String collector;

    private String collectionLocation;

    private Instant collectionDateTime;

    @Indexed
    private String currentCustodian;

    private String currentCustodianRole;

    @Builder.Default
    private EvidenceStatus status = EvidenceStatus.COLLECTED;

    private String sealNumber;

    private String condition;

    // Digital evidence integrity
    private String storageKey;
    private String hash;
    @Builder.Default
    private TamperState tamperState = TamperState.NOT_APPLICABLE;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
