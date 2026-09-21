package com.investigation.dms.dto.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionResponse {
    private String id;
    private String documentId;
    private int versionNumber;
    private String hash;
    private String uploaderId;
    private long size;
    private String mimeType;
    private String originalFilename;
    private String changeDescription;
    private Instant createdAt;
}
