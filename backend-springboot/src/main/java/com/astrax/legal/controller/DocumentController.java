package com.astrax.legal.controller;

import com.astrax.legal.model.DocumentEntity;
import com.astrax.legal.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentRepository documentRepository;

    public DocumentController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllDocuments() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<DocumentEntity> docs = documentRepository.findAll();
            response.put("connected", true);
            response.put("data", docs);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("connected", false);
            response.put("error", e.getMessage());
            response.put("data", Collections.emptyList());
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentEntity> getDocumentById(@PathVariable String id) {
        return documentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> uploadDocument(@RequestBody DocumentEntity doc) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (doc.getId() == null || doc.getId().isEmpty()) {
                doc.setId("DOC-" + System.currentTimeMillis());
            }
            if (doc.getCreatedAt() == null) {
                doc.setCreatedAt(Instant.now().toString());
            }
            doc.setUpdatedAt(Instant.now().toString());

            // Compute SHA-256 if fileContent exists and hash not provided
            if ((doc.getSha256Hash() == null || doc.getSha256Hash().isEmpty()) && doc.getFileContent() != null) {
                doc.setSha256Hash(computeSha256(doc.getFileContent()));
                doc.setOriginalHash(doc.getSha256Hash());
            }

            if (doc.getTamperState() == null) {
                doc.setTamperState("VALID");
            }
            if (doc.getCurrentVersion() == 0) {
                doc.setCurrentVersion(1);
            }

            DocumentEntity saved = documentRepository.save(doc);
            response.put("success", true);
            response.put("document", saved);
            response.put("insertedId", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/version")
    public ResponseEntity<Map<String, Object>> uploadVersion(
            @PathVariable String id,
            @RequestBody Map<String, Object> versionData
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<DocumentEntity> docOpt = documentRepository.findById(id);
            if (docOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            DocumentEntity doc = docOpt.get();
            int nextVersion = doc.getCurrentVersion() + 1;
            doc.setCurrentVersion(nextVersion);

            String newContent = (String) versionData.get("fileContent");
            if (newContent != null) {
                doc.setFileContent(newContent);
                doc.setSha256Hash(computeSha256(newContent));
            }

            List<Map<String, Object>> versions = doc.getVersions();
            if (versions == null) {
                versions = new ArrayList<>();
            }
            Map<String, Object> v = new HashMap<>(versionData);
            v.put("versionNumber", nextVersion);
            v.put("timestamp", Instant.now().toString());
            versions.add(v);
            doc.setVersions(versions);
            doc.setUpdatedAt(Instant.now().toString());

            documentRepository.save(doc);
            response.put("success", true);
            response.put("document", doc);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Map<String, Object>> verifyIntegrity(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        Optional<DocumentEntity> docOpt = documentRepository.findById(id);
        if (docOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        DocumentEntity doc = docOpt.get();
        boolean valid = doc.getSha256Hash() != null && doc.getSha256Hash().equals(doc.getOriginalHash());
        response.put("documentId", doc.getId());
        response.put("status", valid ? "VALID" : "TAMPERED");
        response.put("currentHash", doc.getSha256Hash());
        response.put("originalHash", doc.getOriginalHash());
        return ResponseEntity.ok(response);
    }

    private String computeSha256(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            return UUID.randomUUID().toString().replace("-", "");
        }
    }
}
