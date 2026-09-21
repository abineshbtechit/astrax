package com.investigation.dms.service;

import com.investigation.dms.config.AppProperties;
import com.investigation.dms.common.exception.BadRequestException;
import com.investigation.dms.common.exception.FileTooLargeException;
import com.investigation.dms.common.exception.UnsupportedMediaException;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/**
 * Validates uploaded files against the configurable allowlist (SRS section 15):
 * checks extension, declared size and, most importantly, the detected MIME type /
 * content signature via Apache Tika rather than trusting the client-declared type.
 */
@Service
public class FileValidationService {

    private final AppProperties appProperties;
    private final Tika tika = new Tika();

    public FileValidationService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public record ValidationResult(String detectedMime, String extension) {
    }

    public ValidationResult validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }
        if (file.getSize() > appProperties.getMaxFileSize()) {
            throw new FileTooLargeException("File exceeds maximum size of "
                    + appProperties.getMaxFileSize() + " bytes");
        }

        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null) {
            throw new UnsupportedMediaException("File has no extension");
        }
        ext = ext.toLowerCase();
        if (!appProperties.getAllowedExtensions().contains(ext)) {
            throw new UnsupportedMediaException("File extension '" + ext + "' is not allowed");
        }

        String detected;
        try {
            detected = tika.detect(file.getBytes(), file.getOriginalFilename());
        } catch (Exception e) {
            throw new BadRequestException("Could not read uploaded file content");
        }

        if (!appProperties.getAllowedMimeTypes().contains(detected)) {
            throw new UnsupportedMediaException("Detected content type '" + detected + "' is not allowed");
        }

        return new ValidationResult(detected, ext);
    }

    public String detectMime(byte[] content, String filename) {
        return tika.detect(content, filename);
    }
}
