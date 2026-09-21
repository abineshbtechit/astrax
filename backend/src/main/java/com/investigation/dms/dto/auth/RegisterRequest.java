package com.investigation.dms.dto.auth;

import com.investigation.dms.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.Set;

@Data
public class RegisterRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank
    @Email
    private String email;

    private String departmentId;

    private String badgeNumber;

    @NotEmpty
    private Set<Role> roles;

    @NotBlank
    @Size(min = 8, max = 100)
    private String password;
}
