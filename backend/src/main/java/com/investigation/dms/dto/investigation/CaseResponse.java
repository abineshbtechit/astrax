package com.investigation.dms.dto.investigation;

import com.investigation.dms.common.enums.CasePriority;
import com.investigation.dms.common.enums.CaseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaseResponse {
    private String id;
    private String caseNumber;
    private String title;
    private String crimeType;
    private String description;
    private String location;
    private CaseStatus status;
    private CasePriority priority;
    private String ownerDepartmentId;
    private String createdBy;
    private String investigatingOfficer;
    private List<String> participatingDepartmentIds;
    private long documentCount;
    private long evidenceCount;
    private Instant createdAt;
    private Instant updatedAt;
}
