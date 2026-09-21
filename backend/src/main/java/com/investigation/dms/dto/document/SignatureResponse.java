package com.investigation.dms.dto.document;

import com.investigation.dms.common.enums.SignatureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignatureResponse {
    private String id;
    private String documentId;
    private Integer versionNumber;
    private String signerId;
    private String signerRole;
    private String documentHash;
    private String signatureValue;
    private String certificateIssuer;
    private SignatureStatus status;
    private Instant signedAt;
}
