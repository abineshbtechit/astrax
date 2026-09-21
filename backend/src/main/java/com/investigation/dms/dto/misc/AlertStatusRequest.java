package com.investigation.dms.dto.misc;

import com.investigation.dms.common.enums.AlertStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AlertStatusRequest {
    @NotNull
    private AlertStatus status;
    private String note;
}
