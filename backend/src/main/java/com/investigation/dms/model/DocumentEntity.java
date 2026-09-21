package com.investigation.dms.model;

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
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "documents")
public class DocumentEntity {

    @Id
    private String id;

    @Indexed
    private String investigationId;

    private String documentName;

    @Indexed
    private DocumentType type;

    @Indexed
    private Classification classification;

    private String originalFilename;

    private String storageKey;

    private String mimeType;

    private long size;

    @Indexed
    private String sha256;

    @Builder.Default
    private int currentVersion = 1;

    @Indexed
    private String ownerUserId;

    @Indexed
    private String ownerDepartmentId;

    // Encryption metadata (dummy/reference only; real crypto handled by storage provider)
    private boolean encrypted;
    private String encryptionAlgorithm;

    @Builder.Default
    private WorkflowStatus workflowStatus = WorkflowStatus.DRAFT;

    @Builder.Default
    private IntegrityStatus integrityStatus = IntegrityStatus.NOT_VERIFIED;

    @Builder.Default
    private SignatureStatus signatureStatus = SignatureStatus.NOT_SIGNED;

    // OCR metadata
    @Builder.Default
    private OcrStatus ocrStatus = OcrStatus.PENDING;
    private Instant ocrExtractedAt;
    private String extractedText;

    private String rejectionReason;
    private boolean finalized;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
