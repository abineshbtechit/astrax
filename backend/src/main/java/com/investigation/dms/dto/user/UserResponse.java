package com.investigation.dms.dto.user;

import com.investigation.dms.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String badgeNumber;
    private Set<Role> roles;
    private String departmentId;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
