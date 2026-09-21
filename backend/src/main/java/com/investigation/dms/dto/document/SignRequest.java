package com.investigation.dms.dto.document;

import lombok.Data;

@Data
public class SignRequest {
    // Optional; production integrates an approved PKI provider.
    private String certificateIssuer;
    private String reason;
}
