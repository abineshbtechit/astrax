package com.astrax.legal.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.database:ncrb_legal_dms}")
    private String databaseName;

    @Value("${spring.data.mongodb.uri:}")
    private String mongoUri;

    public HealthController(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> res = new HashMap<>();
        res.put("status", "ok");
        res.put("service", "AstraX Secure Legal & Evidentiary DMS - Spring Boot Backend");
        res.put("framework", "Spring Boot 3.2.3");
        res.put("database", databaseName);

        boolean mongoConnected = false;
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            mongoConnected = true;
        } catch (Exception e) {
            mongoConnected = false;
        }

        res.put("mongoConnected", mongoConnected);
        res.put("mode", mongoConnected ? "MONGODB_ATLAS_CLOUD" : "ENCLAVE_LOCAL_STORAGE");
        res.put("configuredUri", mongoUri != null ? mongoUri.replaceAll(":[^@]+@", ":****@") : "NOT_CONFIGURED");
        res.put("message", mongoConnected
                ? "Connected to MongoDB Atlas cluster (" + databaseName + ")"
                : "Awaiting MongoDB connection - operating in secure enclave mode.");

        return ResponseEntity.ok(res);
    }
}
