package com.astrax.legal.controller;

import com.astrax.legal.model.CaseEntity;
import com.astrax.legal.repository.CaseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/cases")
public class CaseController {

    private final CaseRepository caseRepository;

    public CaseController(CaseRepository caseRepository) {
        this.caseRepository = caseRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllCases() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<CaseEntity> cases = caseRepository.findAll();
            response.put("connected", true);
            response.put("data", cases);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("connected", false);
            response.put("error", e.getMessage());
            response.put("data", Collections.emptyList());
            return ResponseEntity.status(HttpStatus.OK).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<CaseEntity> getCaseById(@PathVariable String id) {
        return caseRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createCase(@RequestBody CaseEntity newCase) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (newCase.getId() == null || newCase.getId().isEmpty()) {
                newCase.setId("CASE-" + System.currentTimeMillis());
            }
            if (newCase.getCreatedAt() == null) {
                newCase.setCreatedAt(Instant.now().toString());
            }
            newCase.setUpdatedAt(Instant.now().toString());

            CaseEntity saved = caseRepository.save(newCase);
            response.put("success", true);
            response.put("case", saved);
            response.put("insertedId", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCase(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<CaseEntity> existingOpt = caseRepository.findById(id);
            if (existingOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            CaseEntity existing = existingOpt.get();
            if (updates.containsKey("status")) {
                existing.setStatus((String) updates.get("status"));
            }
            if (updates.containsKey("title")) {
                existing.setTitle((String) updates.get("title"));
            }
            if (updates.containsKey("priority")) {
                existing.setPriority((String) updates.get("priority"));
            }
            if (updates.containsKey("description")) {
                existing.setDescription((String) updates.get("description"));
            }
            existing.setUpdatedAt(Instant.now().toString());

            caseRepository.save(existing);
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCase(@PathVariable String id) {
        caseRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
