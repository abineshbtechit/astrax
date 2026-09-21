package com.investigation.dms.service;

import com.investigation.dms.common.enums.AlertSeverity;
import com.investigation.dms.common.enums.AlertType;
import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.enums.IntegrityStatus;
import com.investigation.dms.common.enums.OcrStatus;
import com.investigation.dms.common.enums.Permission;
import com.investigation.dms.common.enums.SignatureStatus;
import com.investigation.dms.common.enums.WorkflowStatus;
import com.investigation.dms.common.exception.BusinessValidationException;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.document.DocumentResponse;
import com.investigation.dms.dto.document.PreviewResponse;
import com.investigation.dms.dto.document.SignRequest;
import com.investigation.dms.dto.document.SignatureResponse;
import com.investigation.dms.dto.document.UploadDocumentRequest;
import com.investigation.dms.dto.document.VerifyResponse;
import com.investigation.dms.dto.document.VersionResponse;
import com.investigation.dms.model.DigitalSignature;
import com.investigation.dms.model.DocumentEntity;
import com.investigation.dms.model.DocumentVersion;
import com.investigation.dms.model.Investigation;
import com.investigation.dms.repository.DigitalSignatureRepository;
import com.investigation.dms.repository.DocumentRepository;
import com.investigation.dms.repository.DocumentVersionRepository;
import com.investigation.dms.security.UserPrincipal;
import com.investigation.dms.storage.StorageService;
import com.investigation.dms.util.HashUtil;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.Base64;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final DigitalSignatureRepository signatureRepository;
    private final StorageService storageService;
    private final FileValidationService fileValidationService;
    private final AccessControlService accessControl;
    private final AuditService auditService;
    private final SecurityAlertService securityAlertService;
    private final OcrService ocrService;
    private final TimelineService timelineService;
    private final InvestigationService investigationService;

    public DocumentService(DocumentRepository documentRepository,
                           DocumentVersionRepository versionRepository,
                           DigitalSignatureRepository signatureRepository,
                           StorageService storageService,
                           FileValidationService fileValidationService,
                           AccessControlService accessControl,
                           AuditService auditService,
                           SecurityAlertService securityAlertService,
                           OcrService ocrService,
                           TimelineService timelineService,
                           InvestigationService investigationService) {
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
        this.signatureRepository = signatureRepository;
        this.storageService = storageService;
        this.fileValidationService = fileValidationService;
        this.accessControl = accessControl;
        this.auditService = auditService;
        this.securityAlertService = securityAlertService;
        this.ocrService = ocrService;
        this.timelineService = timelineService;
        this.investigationService = investigationService;
    }

    // --------------------------- Upload ---------------------------

    public DocumentResponse upload(UploadDocumentRequest request, MultipartFile file, UserPrincipal principal) {
        Investigation inv = investigationService.require(request.getInvestigationId());
        accessControl.requireCaseWrite(principal, inv);

        FileValidationService.ValidationResult validation = fileValidationService.validate(file);

        byte[] content = readBytes(file);
        String hash = HashUtil.sha256(content);
        String storageKey = storageService.store(content, file.getOriginalFilename());

        DocumentEntity doc = DocumentEntity.builder()
                .investigationId(request.getInvestigationId())
                .documentName(request.getDocumentName())
                .type(request.getType())
                .classification(request.getClassification())
                .originalFilename(file.getOriginalFilename())
                .storageKey(storageKey)
                .mimeType(validation.detectedMime())
                .size(content.length)
                .sha256(hash)
                .currentVersion(1)
                .ownerUserId(principal.getId())
                .ownerDepartmentId(principal.getDepartmentId())
                .encrypted(false)
                .encryptionAlgorithm("NONE")
                .workflowStatus(WorkflowStatus.DRAFT)
                .integrityStatus(IntegrityStatus.VALID)
                .signatureStatus(SignatureStatus.NOT_SIGNED)
                .ocrStatus(OcrStatus.PENDING)
                .build();
        doc = documentRepository.save(doc);

        // Persist initial version.
        versionRepository.save(DocumentVersion.builder()
                .documentId(doc.getId())
                .versionNumber(1)
                .storageKey(storageKey)
                .hash(hash)
                .uploaderId(principal.getId())
                .size(content.length)
                .mimeType(validation.detectedMime())
                .originalFilename(file.getOriginalFilename())
                .changeDescription("Initial version")
                .createdAt(Instant.now())
                .build());

        // Kick off OCR asynchronously.
        ocrService.extractAsync(doc.getId());

        timelineService.add(inv.getId(), "DOCUMENT_UPLOADED", "Document uploaded: " + doc.getDocumentName(),
                doc.getType() + " (" + doc.getClassification() + ")",
                principal.getUsername(), firstRole(principal), doc.getId(), null);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_UPLOADED,
                inv.getId(), doc.getId(), null, "SUCCESS", "Uploaded " + doc.getDocumentName(), null, null);

        return toResponse(doc);
    }

    // --------------------------- Listing / detail ---------------------------

    public List<DocumentResponse> list(String investigationId, UserPrincipal principal) {
        List<DocumentEntity> docs = investigationId != null
                ? documentRepository.findByInvestigationId(investigationId)
                : documentRepository.findAll();
        return docs.stream()
                .filter(d -> accessControl.hasDocumentPermission(principal, d, Permission.VIEW))
                .map(this::toResponse)
                .toList();
    }

    public DocumentEntity require(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
    }

    public DocumentResponse get(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VIEW);
        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_VIEWED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Viewed metadata", null, null);
        return toResponse(doc);
    }

    // --------------------------- Versioning ---------------------------

    public VersionResponse uploadVersion(String id, MultipartFile file, String changeDescription,
                                         UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VERSION_UPLOAD);
        if (doc.isFinalized()) {
            throw new BusinessValidationException("Cannot add versions to a finalized document");
        }

        FileValidationService.ValidationResult validation = fileValidationService.validate(file);
        byte[] content = readBytes(file);
        String hash = HashUtil.sha256(content);
        String storageKey = storageService.store(content, file.getOriginalFilename());

        int newVersion = doc.getCurrentVersion() + 1;
        DocumentVersion version = versionRepository.save(DocumentVersion.builder()
                .documentId(doc.getId())
                .versionNumber(newVersion)
                .storageKey(storageKey)
                .hash(hash)
                .uploaderId(principal.getId())
                .size(content.length)
                .mimeType(validation.detectedMime())
                .originalFilename(file.getOriginalFilename())
                .changeDescription(StringUtils.hasText(changeDescription) ? changeDescription : "Version " + newVersion)
                .createdAt(Instant.now())
                .build());

        // Point the document head at the new version.
        doc.setCurrentVersion(newVersion);
        doc.setStorageKey(storageKey);
        doc.setSha256(hash);
        doc.setMimeType(validation.detectedMime());
        doc.setSize(content.length);
        doc.setOriginalFilename(file.getOriginalFilename());
        doc.setIntegrityStatus(IntegrityStatus.VALID);
        // New content invalidates prior signature.
        doc.setSignatureStatus(SignatureStatus.NOT_SIGNED);
        doc.setOcrStatus(OcrStatus.PENDING);
        documentRepository.save(doc);

        ocrService.extractAsync(doc.getId());

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.VERSION_UPLOADED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Uploaded version " + newVersion, null, null);

        return toVersionResponse(version);
    }

    public List<VersionResponse> versions(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VIEW);
        return versionRepository.findByDocumentIdOrderByVersionNumberDesc(id).stream()
                .map(this::toVersionResponse)
                .toList();
    }

    // --------------------------- Preview / download ---------------------------

    public PreviewResponse previewSecure(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VIEW);
        byte[] content = storageService.retrieve(doc.getStorageKey());

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_VIEWED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Secure preview", null, null);

        String watermark = principal.getUsername() + " | " + doc.getClassification()
                + " | " + Instant.now();

        return PreviewResponse.builder()
                .documentId(doc.getId())
                .documentName(doc.getDocumentName())
                .mimeType(doc.getMimeType())
                .classification(doc.getClassification().name())
                .watermarkText(watermark)
                .contentBase64(Base64.getEncoder().encodeToString(content))
                .build();
    }

    public record DownloadPayload(byte[] content, String filename, String mimeType) {
    }

    public DownloadPayload download(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.DOWNLOAD);
        byte[] content = storageService.retrieve(doc.getStorageKey());

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_DOWNLOADED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Downloaded document", null, null);

        return new DownloadPayload(content, doc.getOriginalFilename(), doc.getMimeType());
    }

    // --------------------------- Integrity verification ---------------------------

    public VerifyResponse verify(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VIEW);

        byte[] content = storageService.retrieve(doc.getStorageKey());
        String recalculated = HashUtil.sha256(content);
        boolean match = recalculated.equals(doc.getSha256());

        IntegrityStatus status = match ? IntegrityStatus.VALID : IntegrityStatus.TAMPERED;
        doc.setIntegrityStatus(status);
        documentRepository.save(doc);

        auditService.record(principal.getUsername(), firstRole(principal),
                match ? AuditAction.INTEGRITY_VERIFIED : AuditAction.TAMPER_DETECTED,
                doc.getInvestigationId(), doc.getId(), null, match ? "SUCCESS" : "TAMPERED",
                "Integrity check: " + status, null, null);

        if (!match) {
            securityAlertService.raise(AlertType.INTEGRITY_FAILURE, AlertSeverity.CRITICAL,
                    principal.getUsername(),
                    "Integrity mismatch detected on document " + doc.getId(),
                    doc.getInvestigationId(), doc.getId(), null);
        }

        return VerifyResponse.builder()
                .documentId(doc.getId())
                .status(status)
                .storedHash(doc.getSha256())
                .recalculatedHash(recalculated)
                .match(match)
                .build();
    }

    // --------------------------- Workflow ---------------------------

    public DocumentResponse submit(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        requireOwnerOrWrite(principal, doc);
        if (doc.getWorkflowStatus() != WorkflowStatus.DRAFT
                && doc.getWorkflowStatus() != WorkflowStatus.REJECTED) {
            throw new BusinessValidationException("Only DRAFT or REJECTED documents can be submitted");
        }
        doc.setWorkflowStatus(WorkflowStatus.SUBMITTED);
        doc.setRejectionReason(null);
        documentRepository.save(doc);
        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_SUBMITTED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Submitted for review", null, null);
        return toResponse(doc);
    }

    public DocumentResponse approve(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireCaseWrite(principal, investigationService.require(doc.getInvestigationId()));
        if (doc.getWorkflowStatus() != WorkflowStatus.SUBMITTED
                && doc.getWorkflowStatus() != WorkflowStatus.UNDER_REVIEW) {
            throw new BusinessValidationException("Only SUBMITTED/UNDER_REVIEW documents can be approved");
        }
        doc.setWorkflowStatus(WorkflowStatus.APPROVED);
        documentRepository.save(doc);
        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_APPROVED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Approved document", null, null);
        return toResponse(doc);
    }

    public DocumentResponse reject(String id, String reason, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireCaseWrite(principal, investigationService.require(doc.getInvestigationId()));
        if (doc.getWorkflowStatus() != WorkflowStatus.SUBMITTED
                && doc.getWorkflowStatus() != WorkflowStatus.UNDER_REVIEW) {
            throw new BusinessValidationException("Only SUBMITTED/UNDER_REVIEW documents can be rejected");
        }
        doc.setWorkflowStatus(WorkflowStatus.REJECTED);
        doc.setRejectionReason(reason);
        documentRepository.save(doc);
        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_REJECTED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Rejected: " + reason, null, null);
        return toResponse(doc);
    }

    public DocumentResponse finalizeDocument(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        requireOwnerOrWrite(principal, doc);
        if (doc.getWorkflowStatus() != WorkflowStatus.APPROVED
                && doc.getWorkflowStatus() != WorkflowStatus.SIGNED) {
            throw new BusinessValidationException("Only APPROVED or SIGNED documents can be finalized");
        }
        doc.setWorkflowStatus(WorkflowStatus.FINAL);
        doc.setFinalized(true);
        documentRepository.save(doc);
        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_FINALIZED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Finalized document", null, null);
        return toResponse(doc);
    }

    // --------------------------- Digital signature ---------------------------

    public SignatureResponse sign(String id, SignRequest request, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VIEW);

        // Bind the signature to the current authoritative document hash.
        String documentHash = doc.getSha256();
        // Demo signature value derived from hash + signer. Production MUST use an
        // approved PKI/cryptographic signing provider (see SRS 19.2 / Appendix B).
        String signatureValue = HashUtil.sha256(documentHash + "|" + principal.getId() + "|" + Instant.now());

        DigitalSignature signature = signatureRepository.save(DigitalSignature.builder()
                .documentId(doc.getId())
                .versionNumber(doc.getCurrentVersion())
                .signerId(principal.getId())
                .signerRole(firstRole(principal))
                .documentHash(documentHash)
                .signatureValue(signatureValue)
                .certificateIssuer(StringUtils.hasText(request.getCertificateIssuer())
                        ? request.getCertificateIssuer() : "DEV-SELF-SIGNED")
                .status(SignatureStatus.SIGNED)
                .signedAt(Instant.now())
                .build());

        doc.setSignatureStatus(SignatureStatus.SIGNED);
        if (doc.getWorkflowStatus() == WorkflowStatus.APPROVED) {
            doc.setWorkflowStatus(WorkflowStatus.SIGNED);
        }
        documentRepository.save(doc);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_SIGNED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Signed document", null, null);

        return toSignatureResponse(signature);
    }

    public List<SignatureResponse> signatures(String id, UserPrincipal principal) {
        DocumentEntity doc = require(id);
        accessControl.requireDocumentPermission(principal, doc, Permission.VIEW);
        return signatureRepository.findByDocumentId(id).stream().map(this::toSignatureResponse).toList();
    }

    // --------------------------- Helpers ---------------------------

    private void requireOwnerOrWrite(UserPrincipal principal, DocumentEntity doc) {
        if (accessControl.isDocumentOwnerOrAdmin(principal, doc)) {
            return;
        }
        accessControl.requireCaseWrite(principal, investigationService.require(doc.getInvestigationId()));
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (Exception e) {
            throw new BusinessValidationException("Could not read uploaded file");
        }
    }

    public DocumentResponse toResponse(DocumentEntity d) {
        return DocumentResponse.builder()
                .id(d.getId())
                .investigationId(d.getInvestigationId())
                .documentName(d.getDocumentName())
                .type(d.getType())
                .classification(d.getClassification())
                .originalFilename(d.getOriginalFilename())
                .mimeType(d.getMimeType())
                .size(d.getSize())
                .sha256(d.getSha256())
                .currentVersion(d.getCurrentVersion())
                .ownerUserId(d.getOwnerUserId())
                .ownerDepartmentId(d.getOwnerDepartmentId())
                .workflowStatus(d.getWorkflowStatus())
                .integrityStatus(d.getIntegrityStatus())
                .signatureStatus(d.getSignatureStatus())
                .ocrStatus(d.getOcrStatus())
                .finalized(d.isFinalized())
                .rejectionReason(d.getRejectionReason())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }

    private VersionResponse toVersionResponse(DocumentVersion v) {
        return VersionResponse.builder()
                .id(v.getId())
                .documentId(v.getDocumentId())
                .versionNumber(v.getVersionNumber())
                .hash(v.getHash())
                .uploaderId(v.getUploaderId())
                .size(v.getSize())
                .mimeType(v.getMimeType())
                .originalFilename(v.getOriginalFilename())
                .changeDescription(v.getChangeDescription())
                .createdAt(v.getCreatedAt())
                .build();
    }

    private SignatureResponse toSignatureResponse(DigitalSignature s) {
        return SignatureResponse.builder()
                .id(s.getId())
                .documentId(s.getDocumentId())
                .versionNumber(s.getVersionNumber())
                .signerId(s.getSignerId())
                .signerRole(s.getSignerRole())
                .documentHash(s.getDocumentHash())
                .signatureValue(s.getSignatureValue())
                .certificateIssuer(s.getCertificateIssuer())
                .status(s.getStatus())
                .signedAt(s.getSignedAt())
                .build();
    }

    private String firstRole(UserPrincipal principal) {
        return principal.getRoleNames().isEmpty() ? null : principal.getRoleNames().get(0);
    }
}
