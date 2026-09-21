package com.investigation.dms.dto.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PreviewResponse {
    private String documentId;
    private String documentName;
    private String mimeType;
    private String classification;
    private String watermarkText;
    // Base64 preview payload for controlled inline rendering.
    private String contentBase64;
}
