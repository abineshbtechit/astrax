package com.investigation.dms.dto.investigation;

import com.investigation.dms.common.enums.CasePriority;
import com.investigation.dms.common.enums.CaseStatus;
import lombok.Data;

import java.util.List;

@Data
public class UpdateCaseRequest {
    private String title;
    private String crimeType;
    private String description;
    private String location;
    private CasePriority priority;
    private CaseStatus status;
    private String statusNote;
    private String investigatingOfficer;
    private List<String> participatingDepartmentIds;
}
