package com.investigation.dms.dto.evidence;

import lombok.Data;

@Data
public class ReceiveRequest {
    private String conditionAfter;
    private String sealVerification;
    private String signature;
    private boolean sealIntact;
}
