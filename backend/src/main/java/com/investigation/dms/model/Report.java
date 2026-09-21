package com.investigation.dms.model;

import com.investigation.dms.common.enums.ReportStatus;
import com.investigation.dms.common.enums.ReportType;
import com.investigation.dms.common.enums.SignatureStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reports")
public class Report {

    @Id
    private String id;

    @Indexed
    private String investigationId;

    private ReportType reportType;

    private String generatedBy;

    private String outputReference;

    @Builder.Default
    private Map<String, Object> content = new HashMap<>();

    @Builder.Default
    private ReportStatus status = ReportStatus.COMPLETED;

    @Builder.Default
    private SignatureStatus signatureState = SignatureStatus.NOT_SIGNED;

    @CreatedDate
    private Instant createdAt;
}
