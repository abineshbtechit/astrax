package com.investigation.dms.dto.misc;

import com.investigation.dms.common.enums.ReportStatus;
import com.investigation.dms.common.enums.ReportType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {
    private String id;
    private String investigationId;
    private ReportType reportType;
    private String generatedBy;
    private ReportStatus status;
    private Map<String, Object> content;
    private Instant createdAt;
}
