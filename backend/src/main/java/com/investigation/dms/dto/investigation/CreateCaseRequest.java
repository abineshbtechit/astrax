package com.investigation.dms.dto.investigation;

import com.investigation.dms.common.enums.CasePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateCaseRequest {
    // caseNumber optional; auto-generated if blank
    private String caseNumber;

    @NotBlank
    private String title;

    @NotBlank
    private String crimeType;

    private String description;

    private String location;

    @NotNull
    private CasePriority priority;

    private String ownerDepartmentId;

    private String investigatingOfficer;

    private List<String> participatingDepartmentIds;
}
