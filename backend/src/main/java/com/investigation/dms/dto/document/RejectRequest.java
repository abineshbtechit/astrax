package com.investigation.dms.dto.document;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectRequest {
    @NotBlank
    private String reason;
}
