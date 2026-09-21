package com.investigation.dms.dto.department;

import com.investigation.dms.common.enums.DepartmentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentResponse {
    private String id;
    private String departmentCode;
    private String name;
    private DepartmentType type;
    private String status;
}
