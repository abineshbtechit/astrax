package com.investigation.dms.dto.department;

import com.investigation.dms.common.enums.DepartmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DepartmentRequest {
    @NotBlank
    private String departmentCode;

    @NotBlank
    private String name;

    @NotNull
    private DepartmentType type;
}
