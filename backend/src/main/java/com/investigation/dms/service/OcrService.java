package com.investigation.dms.service;

import com.investigation.dms.common.enums.OcrStatus;
import com.investigation.dms.model.DocumentEntity;
import com.investigation.dms.repository.DocumentRepository;
import com.investigation.dms.storage.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.time.Instant;

/**
 * OCR / text-extraction service (FR-OCR-001, section 20.1). Uses Apache Tika for
 * text extraction from supported files. Runs asynchronously so a failed or slow
 * extraction never blocks ordinary document metadata access. Extracted text is
 * only ever returned to users who are authorized for the document.
 */
@Slf4j
@Service
public class OcrService {

    private final DocumentRepository documentRepository;
    private final StorageService storageService;
    private final Tika tika = new Tika();

    public OcrService(DocumentRepository documentRepository, StorageService storageService) {
        this.documentRepository = documentRepository;
        this.storageService = storageService;
    }

    @Async("taskExecutor")
    public void extractAsync(String documentId) {
        DocumentEntity doc = documentRepository.findById(documentId).orElse(null);
        if (doc == null) {
            return;
        }
        try {
            doc.setOcrStatus(OcrStatus.PROCESSING);
            documentRepository.save(doc);

            byte[] bytes = storageService.retrieve(doc.getStorageKey());
            // Tika limits extracted characters by default; raise as needed.
            String text = tika.parseToString(new ByteArrayInputStream(bytes));

            doc.setExtractedText(text == null ? "" : text.trim());
            doc.setOcrStatus(OcrStatus.COMPLETED);
            doc.setOcrExtractedAt(Instant.now());
            documentRepository.save(doc);
            log.info("OCR completed for document {}", documentId);
        } catch (Exception e) {
            log.warn("OCR failed for document {}: {}", documentId, e.getMessage());
            doc.setOcrStatus(OcrStatus.FAILED);
            documentRepository.save(doc);
        }
    }
}
