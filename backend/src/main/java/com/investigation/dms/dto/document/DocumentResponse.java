package com.investigation.dms.dto.document;

import com.investigation.dms.common.enums.Classification;
import com.investigation.dms.common.enums.DocumentType;
import com.investigation.dms.common.enums.IntegrityStatus;
import com.investigation.dms.common.enums.OcrStatus;
import com.investigation.dms.common.enums.SignatureStatus;
import com.investigation.dms.common.enums.WorkflowStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private String id;
    private String investigationId;
    private String documentName;
    private DocumentType type;
    private Classification classification;
    private String originalFilename;
    private String mimeType;
    private long size;
    private String sha256;
    private int currentVersion;
    private String ownerUserId;
    private String ownerDepartmentId;
    private WorkflowStatus workflowStatus;
    private IntegrityStatus integrityStatus;
    private SignatureStatus signatureStatus;
    private OcrStatus ocrStatus;
    private boolean finalized;
    private String rejectionReason;
    private Instant createdAt;
    private Instant updatedAt;
}
