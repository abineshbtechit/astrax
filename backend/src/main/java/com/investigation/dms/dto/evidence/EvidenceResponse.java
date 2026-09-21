package com.investigation.dms.dto.evidence;

import com.investigation.dms.common.enums.EvidenceStatus;
import com.investigation.dms.common.enums.TamperState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceResponse {
    private String id;
    private String evidenceId;
    private String investigationId;
    private String type;
    private String description;
    private String collector;
    private String collectionLocation;
    private Instant collectionDateTime;
    private String currentCustodian;
    private String currentCustodianRole;
    private EvidenceStatus status;
    private String sealNumber;
    private String condition;
    private String hash;
    private TamperState tamperState;
    private Instant createdAt;
    private Instant updatedAt;
}
