package com.investigation.dms.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditChainVerifyResponse {
    private boolean valid;
    private long recordsChecked;
    private String firstBrokenRecordId;
    private Long firstBrokenSequence;
    private String message;
}
