package com.astrax.legal.controller;

import com.astrax.legal.model.AuditLogEntity;
import com.astrax.legal.repository.AuditLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllLogs() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<AuditLogEntity> list = auditLogRepository.findAll();
            response.put("connected", true);
            response.put("data", list);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("connected", false);
            response.put("error", e.getMessage());
            response.put("data", Collections.emptyList());
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createLog(@RequestBody AuditLogEntity log) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (log.getId() == null || log.getId().isEmpty()) {
                log.setId("AUD-" + System.currentTimeMillis());
            }
            if (log.getTimestamp() == null) {
                log.setTimestamp(Instant.now().toString());
            }

            AuditLogEntity saved = auditLogRepository.save(log);
            response.put("success", true);
            response.put("log", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
