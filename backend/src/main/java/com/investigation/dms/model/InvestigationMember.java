package com.investigation.dms.model;

import com.investigation.dms.common.enums.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "investigation_members")
@CompoundIndex(name = "inv_user_idx", def = "{'investigationId': 1, 'userId': 1}", unique = true)
public class InvestigationMember {

    @Id
    private String id;

    @Indexed
    private String investigationId;

    @Indexed
    private String userId;

    private String departmentId;

    private AccessLevel accessLevel;

    private String assignedBy;

    private Instant assignedAt;
}
