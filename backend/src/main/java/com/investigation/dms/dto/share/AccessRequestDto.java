package com.investigation.dms.dto.share;

import com.investigation.dms.common.enums.Permission;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class AccessRequestDto {
    @NotBlank
    private String documentId;

    @NotEmpty
    private Set<Permission> requestedPermissions;

    @NotBlank
    private String reason;
}
