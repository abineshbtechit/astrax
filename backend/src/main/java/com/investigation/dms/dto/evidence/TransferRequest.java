package com.investigation.dms.dto.evidence;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TransferRequest {
    @NotBlank
    private String toUser;

    @NotBlank
    private String reason;

    private String location;

    private String conditionBefore;

    private String signature;
}
