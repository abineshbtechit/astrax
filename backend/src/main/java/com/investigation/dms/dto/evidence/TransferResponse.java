package com.investigation.dms.dto.evidence;

import com.investigation.dms.common.enums.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferResponse {
    private String id;
    private String evidenceId;
    private String fromUser;
    private String toUser;
    private String reason;
    private Instant transferTime;
    private String location;
    private String conditionBefore;
    private String conditionAfter;
    private String signature;
    private TransferStatus status;
    private Instant receivedAt;
    private Instant createdAt;
}
