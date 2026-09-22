package com.astrax.legal.controller;

import com.astrax.legal.model.AccessRequestEntity;
import com.astrax.legal.repository.AccessRequestRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/access-requests")
public class AccessRequestController {

    private final AccessRequestRepository accessRequestRepository;

    public AccessRequestController(AccessRequestRepository accessRequestRepository) {
        this.accessRequestRepository = accessRequestRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllRequests() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<AccessRequestEntity> list = accessRequestRepository.findAll();
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
    public ResponseEntity<Map<String, Object>> submitRequest(@RequestBody AccessRequestEntity req) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (req.getId() == null || req.getId().isEmpty()) {
                req.setId("REQ-" + System.currentTimeMillis());
            }
            if (req.getStatus() == null) {
                req.setStatus("PENDING");
            }
            if (req.getRequestedAt() == null) {
                req.setRequestedAt(Instant.now().toString());
            }

            AccessRequestEntity saved = accessRequestRepository.save(req);
            response.put("success", true);
            response.put("request", saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> payload
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<AccessRequestEntity> opt = accessRequestRepository.findById(id);
            if (opt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            AccessRequestEntity req = opt.get();
            if (payload.containsKey("status")) {
                req.setStatus((String) payload.get("status"));
            }
            if (payload.containsKey("reviewerComment")) {
                req.setReviewerComment((String) payload.get("reviewerComment"));
            }
            if (payload.containsKey("reviewedBy")) {
                req.setReviewedBy((String) payload.get("reviewedBy"));
            }
            req.setReviewedAt(Instant.now().toString());

            accessRequestRepository.save(req);
            response.put("success", true);
            response.put("request", req);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
