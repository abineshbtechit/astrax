package com.investigation.dms.dto.document;

import com.investigation.dms.common.enums.IntegrityStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyResponse {
    private String documentId;
    private IntegrityStatus status;
    private String storedHash;
    private String recalculatedHash;
    private boolean match;
}
