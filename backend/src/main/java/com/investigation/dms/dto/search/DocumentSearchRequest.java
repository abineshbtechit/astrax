package com.investigation.dms.dto.search;

import com.investigation.dms.common.enums.Classification;
import com.investigation.dms.common.enums.DocumentType;
import com.investigation.dms.common.enums.IntegrityStatus;
import com.investigation.dms.common.enums.SignatureStatus;
import com.investigation.dms.common.enums.WorkflowStatus;
import lombok.Data;

import java.time.Instant;

@Data
public class DocumentSearchRequest {
    private String keyword;
    private String caseNumber;
    private DocumentType type;
    private String crimeType;
    private String location;
    private String departmentId;
    private Classification classification;
    private WorkflowStatus workflowStatus;
    private IntegrityStatus integrityStatus;
    private SignatureStatus signatureStatus;
    private Instant fromDate;
    private Instant toDate;
    private int page = 0;
    private int size = 20;
}
