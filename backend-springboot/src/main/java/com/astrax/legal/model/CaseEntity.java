package com.astrax.legal.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;
import java.util.Map;

@Document(collection = "cases")
public class CaseEntity {

    @Id
    private String id;
    private String caseNumber;
    private String title;
    private String crimeType;
    private String description;
    private String location;
    private String status;
    private String priority;
    private String ownerDepartment;
    private String investigatingOfficerId;
    private String investigatingOfficerName;
    private List<String> participatingDepartments;
    private List<Map<String, Object>> members;
    private int documentsCount;
    private int evidenceCount;
    private String createdBy;
    private String createdAt;
    private String updatedAt;

    public CaseEntity() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCaseNumber() { return caseNumber; }
    public void setCaseNumber(String caseNumber) { this.caseNumber = caseNumber; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCrimeType() { return crimeType; }
    public void setCrimeType(String crimeType) { this.crimeType = crimeType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getOwnerDepartment() { return ownerDepartment; }
    public void setOwnerDepartment(String ownerDepartment) { this.ownerDepartment = ownerDepartment; }

    public String getInvestigatingOfficerId() { return investigatingOfficerId; }
    public void setInvestigatingOfficerId(String investigatingOfficerId) { this.investigatingOfficerId = investigatingOfficerId; }

    public String getInvestigatingOfficerName() { return investigatingOfficerName; }
    public void setInvestigatingOfficerName(String investigatingOfficerName) { this.investigatingOfficerName = investigatingOfficerName; }

    public List<String> getParticipatingDepartments() { return participatingDepartments; }
    public void setParticipatingDepartments(List<String> participatingDepartments) { this.participatingDepartments = participatingDepartments; }

    public List<Map<String, Object>> getMembers() { return members; }
    public void setMembers(List<Map<String, Object>> members) { this.members = members; }

    public int getDocumentsCount() { return documentsCount; }
    public void setDocumentsCount(int documentsCount) { this.documentsCount = documentsCount; }

    public int getEvidenceCount() { return evidenceCount; }
    public void setEvidenceCount(int evidenceCount) { this.evidenceCount = evidenceCount; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
