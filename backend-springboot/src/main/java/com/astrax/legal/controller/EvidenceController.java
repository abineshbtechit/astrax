package com.astrax.legal.controller;

import com.astrax.legal.model.EvidenceEntity;
import com.astrax.legal.repository.EvidenceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/evidence")
public class EvidenceController {

    private final EvidenceRepository evidenceRepository;

    public EvidenceController(EvidenceRepository evidenceRepository) {
        this.evidenceRepository = evidenceRepository;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllEvidence() {
        Map<String, Object> response = new HashMap<>();
        try {
            List<EvidenceEntity> list = evidenceRepository.findAll();
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

    @GetMapping("/{id}")
    public ResponseEntity<EvidenceEntity> getEvidenceById(@PathVariable String id) {
        return evidenceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createEvidence(@RequestBody EvidenceEntity item) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (item.getId() == null || item.getId().isEmpty()) {
                item.setId("EVI-" + System.currentTimeMillis());
            }
            if (item.getEvidenceId() == null) {
                item.setEvidenceId("EX-" + (1000 + new Random().nextInt(9000)));
            }
            if (item.getCollectedAt() == null) {
                item.setCollectedAt(Instant.now().toString());
            }
            item.setCreatedAt(Instant.now().toString());
            item.setUpdatedAt(Instant.now().toString());

            EvidenceEntity saved = evidenceRepository.save(item);
            response.put("success", true);
            response.put("evidence", saved);
            response.put("insertedId", saved.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<Map<String, Object>> transferCustody(
            @PathVariable String id,
            @RequestBody Map<String, Object> transferData
    ) {
        Map<String, Object> response = new HashMap<>();
        try {
            Optional<EvidenceEntity> evOpt = evidenceRepository.findById(id);
            if (evOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            EvidenceEntity ev = evOpt.get();
            List<Map<String, Object>> custody = ev.getChainOfCustody();
            if (custody == null) {
                custody = new ArrayList<>();
            }

            Map<String, Object> step = new HashMap<>(transferData);
            step.put("id", "TRANSFER-" + System.currentTimeMillis());
            step.put("timestamp", Instant.now().toString());
            custody.add(step);
            ev.setChainOfCustody(custody);

            if (transferData.containsKey("toUserId")) {
                ev.setCurrentCustodianId((String) transferData.get("toUserId"));
            }
            if (transferData.containsKey("toUserName")) {
                ev.setCurrentCustodianName((String) transferData.get("toUserName"));
            }
            if (transferData.containsKey("toDepartment")) {
                ev.setCurrentDepartment((String) transferData.get("toDepartment"));
            }
            ev.setUpdatedAt(Instant.now().toString());

            evidenceRepository.save(ev);
            response.put("success", true);
            response.put("evidence", ev);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
