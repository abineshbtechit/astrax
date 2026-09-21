package com.investigation.dms.dto.investigation;

import com.investigation.dms.common.enums.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private String id;
    private String investigationId;
    private String userId;
    private String userFullName;
    private String departmentId;
    private AccessLevel accessLevel;
    private Instant assignedAt;
}
