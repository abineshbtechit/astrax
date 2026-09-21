package com.investigation.dms.model;

import com.investigation.dms.common.enums.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "evidence_transfers")
public class EvidenceTransfer {

    @Id
    private String id;

    @Indexed
    private String evidenceId;

    private String fromUser;

    private String toUser;

    private String reason;

    private Instant transferTime;

    private String location;

    private String conditionBefore;

    private String conditionAfter;

    private String signature;

    @Builder.Default
    private TransferStatus status = TransferStatus.PENDING;

    private Instant receivedAt;

    @CreatedDate
    private Instant createdAt;
}
