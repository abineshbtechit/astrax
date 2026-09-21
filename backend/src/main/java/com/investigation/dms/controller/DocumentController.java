package com.investigation.dms.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.common.exception.BadRequestException;
import com.investigation.dms.dto.document.DocumentResponse;
import com.investigation.dms.dto.document.PreviewResponse;
import com.investigation.dms.dto.document.RejectRequest;
import com.investigation.dms.dto.document.SignRequest;
import com.investigation.dms.dto.document.SignatureResponse;
import com.investigation.dms.dto.document.UploadDocumentRequest;
import com.investigation.dms.dto.document.VerifyResponse;
import com.investigation.dms.dto.document.VersionResponse;
import com.investigation.dms.dto.share.ShareRequest;
import com.investigation.dms.dto.share.ShareResponse;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.DocumentService;
import com.investigation.dms.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Tag(name = "Documents")
@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final ShareService shareService;
    private final ObjectMapper objectMapper;

    public DocumentController(DocumentService documentService, ShareService shareService,
                             ObjectMapper objectMapper) {
        this.documentService = documentService;
        this.shareService = shareService;
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "List permitted documents (optionally by investigation)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> list(
            @RequestParam(required = false) String investigationId) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.list(investigationId, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Upload a document (multipart: file + metadata JSON)")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> upload(
            @RequestPart("file") MultipartFile file,
            @RequestPart("metadata") String metadataJson) {
        UploadDocumentRequest request = parse(metadataJson, UploadDocumentRequest.class);
        DocumentResponse response = documentService.upload(request, file, SecurityUtils.currentPrincipal());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "Document uploaded"));
    }

    @Operation(summary = "Get document metadata")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> get(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.get(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Upload a new version")
    @PostMapping(value = "/{id}/upload-version", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<VersionResponse>> uploadVersion(
            @PathVariable String id,
            @RequestPart("file") MultipartFile file,
            @RequestPart(value = "changeDescription", required = false) String changeDescription) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                documentService.uploadVersion(id, file, changeDescription, SecurityUtils.currentPrincipal()),
                "Version uploaded"));
    }

    @Operation(summary = "List versions")
    @GetMapping("/{id}/versions")
    public ResponseEntity<ApiResponse<List<VersionResponse>>> versions(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.versions(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Secure preview with watermark metadata")
    @GetMapping("/{id}/preview-secure")
    public ResponseEntity<ApiResponse<PreviewResponse>> previewSecure(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.previewSecure(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Secure download")
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> download(@PathVariable String id) {
        DocumentService.DownloadPayload payload = documentService.download(id, SecurityUtils.currentPrincipal());
        ByteArrayResource resource = new ByteArrayResource(payload.content());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + payload.filename() + "\"")
                .contentType(MediaType.parseMediaType(
                        payload.mimeType() == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : payload.mimeType()))
                .contentLength(payload.content().length)
                .body(resource);
    }

    @Operation(summary = "Verify SHA-256 integrity")
    @PostMapping("/{id}/verify")
    public ResponseEntity<ApiResponse<VerifyResponse>> verify(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(documentService.verify(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Sign a document")
    @PostMapping("/{id}/sign")
    public ResponseEntity<ApiResponse<SignatureResponse>> sign(
            @PathVariable String id, @RequestBody(required = false) SignRequest request) {
        SignRequest req = request == null ? new SignRequest() : request;
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.sign(id, req, SecurityUtils.currentPrincipal()), "Document signed"));
    }

    @Operation(summary = "List signatures")
    @GetMapping("/{id}/signatures")
    public ResponseEntity<ApiResponse<List<SignatureResponse>>> signatures(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.signatures(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Submit for review")
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<DocumentResponse>> submit(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.submit(id, SecurityUtils.currentPrincipal()), "Document submitted"));
    }

    @Operation(summary = "Approve a document")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<DocumentResponse>> approve(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.approve(id, SecurityUtils.currentPrincipal()), "Document approved"));
    }

    @Operation(summary = "Reject a document")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<DocumentResponse>> reject(
            @PathVariable String id, @Valid @RequestBody RejectRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.reject(id, request.getReason(), SecurityUtils.currentPrincipal()),
                "Document rejected"));
    }

    @Operation(summary = "Finalize a document")
    @PostMapping("/{id}/finalize")
    public ResponseEntity<ApiResponse<DocumentResponse>> finalizeDocument(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                documentService.finalizeDocument(id, SecurityUtils.currentPrincipal()), "Document finalized"));
    }

    // --------------------------- Sharing ---------------------------

    @Operation(summary = "Create an access grant")
    @PostMapping("/{id}/share")
    public ResponseEntity<ApiResponse<ShareResponse>> share(
            @PathVariable String id, @Valid @RequestBody ShareRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
                shareService.share(id, request, SecurityUtils.currentPrincipal()), "Access granted"));
    }

    @Operation(summary = "List access grants")
    @GetMapping("/{id}/shares")
    public ResponseEntity<ApiResponse<List<ShareResponse>>> shares(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.ok(
                shareService.shares(id, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Revoke an access grant")
    @DeleteMapping("/{id}/shares/{shareId}")
    public ResponseEntity<ApiResponse<Void>> revoke(@PathVariable String id, @PathVariable String shareId) {
        shareService.revoke(id, shareId, SecurityUtils.currentPrincipal());
        return ResponseEntity.ok(ApiResponse.message("Grant revoked"));
    }

    private <T> T parse(String json, Class<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new BadRequestException("Invalid metadata JSON: " + e.getMessage());
        }
    }
}
