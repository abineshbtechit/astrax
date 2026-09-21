package com.investigation.dms.model;

import com.investigation.dms.common.enums.SignatureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "digital_signatures")
public class DigitalSignature {

    @Id
    private String id;

    @Indexed
    private String documentId;

    private Integer versionNumber;

    private String signerId;

    private String signerRole;

    private String documentHash;

    private String signatureValue;

    private String certificateIssuer;

    @Builder.Default
    private SignatureStatus status = SignatureStatus.SIGNED;

    private Instant signedAt;
}
