package com.astrax.legal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Map;

@Document(collection = "documents")
public class DocumentEntity {

    @Id
    private String id;
    private String caseId;
    private String caseNumber;
    private String caseTitle;
    private String documentName;
    private String originalFilename;
    private String type;
    private String classification;
    private String mimeType;
    private long sizeBytes;
    private String sha256Hash;
    private String originalHash;
    private String tamperState; // VALID, TAMPERED, RESTORED
    private int currentVersion;
    private List<Map<String, Object>> versions;
    private String ownerDepartment;
    private String ownerUserId;
    private String ownerUserName;
    private List<String> allowedDepartments;
    private List<Map<String, Object>> accessGrants;
    private String workflowStatus;
    private boolean isLegalHold;
    private boolean isSigned;
    private Map<String, Object> digitalSignature;
    private String fileContent;
    private String createdAt;
    private String updatedAt;

    public DocumentEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public String getCaseTitle() { return caseTitle; }
    public void setCaseTitle(String caseTitle) { this.caseTitle = caseTitle; }

    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }

    public String getOriginalFilename() { return originalFilename; }
    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getClassification() { return classification; }
    public void setClassification(String classification) { this.classification = classification; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public long getSizeBytes() { return sizeBytes; }
    public void setSizeBytes(long sizeBytes) { this.sizeBytes = sizeBytes; }

    public String getSha256Hash() { return sha256Hash; }
    public void setSha256Hash(String sha256Hash) { this.sha256Hash = sha256Hash; }

    public String getOriginalHash() { return originalHash; }
    public void setOriginalHash(String originalHash) { this.originalHash = originalHash; }

    public String getTamperState() { return tamperState; }
    public void setTamperState(String tamperState) { this.tamperState = tamperState; }

    public int getCurrentVersion() { return currentVersion; }
    public void setCurrentVersion(int currentVersion) { this.currentVersion = currentVersion; }

    public List<Map<String, Object>> getVersions() { return versions; }
    public void setVersions(List<Map<String, Object>> versions) { this.versions = versions; }

    public String getOwnerDepartment() { return ownerDepartment; }
    public void setOwnerDepartment(String ownerDepartment) { this.ownerDepartment = ownerDepartment; }

    public String getOwnerUserId() { return ownerUserId; }
    public void setOwnerUserId(String ownerUserId) { this.ownerUserId = ownerUserId; }

    public String getOwnerUserName() { return ownerUserName; }
    public void setOwnerUserName(String ownerUserName) { this.ownerUserName = ownerUserName; }

    public List<String> getAllowedDepartments() { return allowedDepartments; }
    public void setAllowedDepartments(List<String> allowedDepartments) { this.allowedDepartments = allowedDepartments; }

    public List<Map<String, Object>> getAccessGrants() { return accessGrants; }
    public void setAccessGrants(List<Map<String, Object>> accessGrants) { this.accessGrants = accessGrants; }

    public String getWorkflowStatus() { return workflowStatus; }
    public void setWorkflowStatus(String workflowStatus) { this.workflowStatus = workflowStatus; }

    public boolean isLegalHold() { return isLegalHold; }
    public void setLegalHold(boolean legalHold) { isLegalHold = legalHold; }

    public boolean isSigned() { return isSigned; }
    public void setSigned(boolean signed) { isSigned = signed; }

    public Map<String, Object> getDigitalSignature() { return digitalSignature; }
    public void setDigitalSignature(Map<String, Object> digitalSignature) { this.digitalSignature = digitalSignature; }

    public String getFileContent() { return fileContent; }
    public void setFileContent(String fileContent) { this.fileContent = fileContent; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
