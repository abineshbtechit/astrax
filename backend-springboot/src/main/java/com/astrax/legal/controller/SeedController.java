package com.astrax.legal.controller;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/seed")
public class SeedController {

    private final MongoTemplate mongoTemplate;

    public SeedController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> seedDatabase(@RequestBody Map<String, List<Map<String, Object>>> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (payload.containsKey("cases")) {
                mongoTemplate.dropCollection("cases");
                for (Map<String, Object> item : payload.get("cases")) {
                    mongoTemplate.save(item, "cases");
                }
            }
            if (payload.containsKey("documents")) {
                mongoTemplate.dropCollection("documents");
                for (Map<String, Object> item : payload.get("documents")) {
                    mongoTemplate.save(item, "documents");
                }
            }
            if (payload.containsKey("evidence")) {
                mongoTemplate.dropCollection("evidence");
                for (Map<String, Object> item : payload.get("evidence")) {
                    mongoTemplate.save(item, "evidence");
                }
            }
            if (payload.containsKey("auditLogs")) {
                mongoTemplate.dropCollection("audit_logs");
                for (Map<String, Object> item : payload.get("auditLogs")) {
                    mongoTemplate.save(item, "audit_logs");
                }
            }
            if (payload.containsKey("accessRequests")) {
                mongoTemplate.dropCollection("access_requests");
                for (Map<String, Object> item : payload.get("accessRequests")) {
                    mongoTemplate.save(item, "access_requests");
                }
            }

            response.put("success", true);
            response.put("message", "Spring Boot MongoDB Atlas collections seeded successfully.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
