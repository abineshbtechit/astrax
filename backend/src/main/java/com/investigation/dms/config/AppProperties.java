package com.investigation.dms.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
@ConfigurationProperties(prefix = "app.documents")
public class AppProperties {
    /** Allowed upload file extensions (lowercase, no dot). */
    private List<String> allowedExtensions = List.of("pdf", "doc", "docx", "jpg", "jpeg", "png", "txt");

    /** Allowed detected MIME types. */
    private List<String> allowedMimeTypes = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "text/plain");

    /** Maximum file size in bytes. */
    private long maxFileSize = 26_214_400L; // 25 MB
}
