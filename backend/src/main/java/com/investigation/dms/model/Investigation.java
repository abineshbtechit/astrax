package com.investigation.dms.model;

import com.investigation.dms.common.enums.CasePriority;
import com.investigation.dms.common.enums.CaseStatus;
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
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "investigations")
public class Investigation {

    @Id
    private String id;

    @Indexed(unique = true)
    private String caseNumber;

    private String title;

    @Indexed
    private String crimeType;

    private String description;

    private String location;

    @Indexed
    private CaseStatus status;

    @Indexed
    private CasePriority priority;

    @Indexed
    private String ownerDepartmentId;

    private String createdBy;

    private String investigatingOfficer;

    @Builder.Default
    private List<String> participatingDepartmentIds = new ArrayList<>();

    @Builder.Default
    private List<StatusHistoryEntry> statusHistory = new ArrayList<>();

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusHistoryEntry {
        private CaseStatus status;
        private String changedBy;
        private Instant changedAt;
        private String note;
    }
}
