package com.investigation.dms.dto.investigation;

import com.investigation.dms.common.enums.AccessLevel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AddMemberRequest {
    @NotBlank
    private String userId;

    private String departmentId;

    @NotNull
    private AccessLevel accessLevel;
}
