package com.investigation.dms.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "document_versions")
@CompoundIndex(name = "doc_version_idx", def = "{'documentId': 1, 'versionNumber': 1}", unique = true)
public class DocumentVersion {

    @Id
    private String id;

    @Indexed
    private String documentId;

    private int versionNumber;

    private String storageKey;

    private String hash;

    private String uploaderId;

    private long size;

    private String mimeType;

    private String originalFilename;

    private String changeDescription;

    private Instant createdAt;
}
