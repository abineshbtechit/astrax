package com.investigation.dms.dto.user;

import com.investigation.dms.common.enums.Role;
import jakarta.validation.constraints.Email;
import lombok.Data;

import java.util.Set;

@Data
public class UpdateUserRequest {
    private String fullName;

    @Email
    private String email;

    private String badgeNumber;

    private String departmentId;

    private Set<Role> roles;

    private Boolean active;
}
