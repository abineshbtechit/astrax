package com.investigation.dms.dto.evidence;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateEvidenceRequest {
    @NotBlank
    private String investigationId;

    @NotBlank
    private String type;

    private String description;

    @NotBlank
    private String collector;

    private String collectionLocation;

    private Instant collectionDateTime;

    private String sealNumber;

    private String condition;

    private String currentCustodian;

    private String currentCustodianRole;
}
