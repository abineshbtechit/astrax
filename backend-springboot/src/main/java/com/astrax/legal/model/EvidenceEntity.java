package com.astrax.legal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Map;

@Document(collection = "evidence")
public class EvidenceEntity {

    @Id
    private String id;
    private String evidenceId;
    private String caseId;
    private String caseNumber;
    private String type;
    private String sealNumber;
    private String storageLocation;
    private String description;
    private String status; // SEIZED, IN_LAB, SUBMITTED_IN_COURT, DISPOSED
    private String currentCustodianId;
    private String currentCustodianName;
    private String currentDepartment;
    private List<Map<String, Object>> chainOfCustody;
    private String collectedAt;
    private String createdAt;
    private String updatedAt;

    public EvidenceEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getEvidenceId() { return evidenceId; }
    public void setEvidenceId(String evidenceId) { this.evidenceId = evidenceId; }

    public String getCaseId() { return caseId; }
    public void setCaseId(String caseId) { this.caseId = caseId; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getSealNumber() { return sealNumber; }
    public void setSealNumber(String sealNumber) { this.sealNumber = sealNumber; }

    public String getStorageLocation() { return storageLocation; }
    public void setStorageLocation(String storageLocation) { this.storageLocation = storageLocation; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCurrentCustodianId() { return currentCustodianId; }
    public void setCurrentCustodianId(String currentCustodianId) { this.currentCustodianId = currentCustodianId; }

    public String getCurrentCustodianName() { return currentCustodianName; }
    public void setCurrentCustodianName(String currentCustodianName) { this.currentCustodianName = currentCustodianName; }

    public String getCurrentDepartment() { return currentDepartment; }
    public void setCurrentDepartment(String currentDepartment) { this.currentDepartment = currentDepartment; }

    public List<Map<String, Object>> getChainOfCustody() { return chainOfCustody; }
    public void setChainOfCustody(List<Map<String, Object>> chainOfCustody) { this.chainOfCustody = chainOfCustody; }

    public String getCollectedAt() { return collectedAt; }
    public void setCollectedAt(String collectedAt) { this.collectedAt = collectedAt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
