package com.investigation.dms.dto.document;

import com.investigation.dms.common.enums.Classification;
import com.investigation.dms.common.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UploadDocumentRequest {
    @NotBlank
    private String investigationId;

    @NotBlank
    private String documentName;

    @NotNull
    private DocumentType type;

    @NotNull
    private Classification classification;
}
