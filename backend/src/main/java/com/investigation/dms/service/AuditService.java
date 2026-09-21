package com.investigation.dms.service;

import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.dto.misc.AuditChainVerifyResponse;
import com.investigation.dms.dto.misc.AuditLogResponse;
import com.investigation.dms.model.AuditLog;
import com.investigation.dms.repository.AuditLogRepository;
import com.investigation.dms.util.HashUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Chained audit logging. Each record stores the hash of the previous record and
 * a current hash derived from canonical event data (FR-AUDIT-001/002, section 19.3).
 * Records are append-only; official audit records must never be TTL-deleted or
 * mutated after creation.
 */
@Slf4j
@Service
public class AuditService {

    private static final String GENESIS_HASH = "0".repeat(64);

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public synchronized AuditLog record(String actor, String actorRole, AuditAction action,
                                        String investigationId, String documentId, String evidenceId,
                                        String result, String description, String ip, String device) {
        AuditLog previous = auditLogRepository.findTopByOrderBySequenceDesc().orElse(null);
        long nextSeq = previous == null ? 1 : previous.getSequence() + 1;
        String prevHash = previous == null ? GENESIS_HASH : previous.getCurrentHash();
        Instant now = Instant.now();

        String canonical = canonical(nextSeq, actor, action, investigationId, documentId,
                evidenceId, result, description, now, prevHash);
        String currentHash = HashUtil.sha256(canonical);

        AuditLog logEntry = AuditLog.builder()
                .actor(actor)
                .actorRole(actorRole)
                .action(action)
                .investigationId(investigationId)
                .documentId(documentId)
                .evidenceId(evidenceId)
                .result(result)
                .description(description)
                .ipAddress(ip)
                .device(device)
                .previousHash(prevHash)
                .currentHash(currentHash)
                .sequence(nextSeq)
                .timestamp(now)
                .build();
        return auditLogRepository.save(logEntry);
    }

    public AuditLog record(String actor, String actorRole, AuditAction action, String description) {
        return record(actor, actorRole, action, null, null, null, "SUCCESS", description, null, null);
    }

    private String canonical(long seq, String actor, AuditAction action, String investigationId,
                             String documentId, String evidenceId, String result, String description,
                             Instant timestamp, String prevHash) {
        return String.join("|",
                String.valueOf(seq),
                nz(actor),
                action == null ? "" : action.name(),
                nz(investigationId),
                nz(documentId),
                nz(evidenceId),
                nz(result),
                nz(description),
                timestamp.toString(),
                nz(prevHash));
    }

    private String nz(String s) {
        return s == null ? "" : s;
    }

    public List<AuditLog> all() {
        return auditLogRepository.findAllByOrderBySequenceAsc();
    }

    public AuditChainVerifyResponse verifyChain() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderBySequenceAsc();
        String expectedPrev = GENESIS_HASH;
        for (AuditLog logEntry : logs) {
            // Validate previous-hash linkage
            if (!expectedPrev.equals(logEntry.getPreviousHash())) {
                return AuditChainVerifyResponse.builder()
                        .valid(false)
                        .recordsChecked(logs.size())
                        .firstBrokenRecordId(logEntry.getId())
                        .firstBrokenSequence(logEntry.getSequence())
                        .message("Previous-hash linkage broken at sequence " + logEntry.getSequence())
                        .build();
            }
            // Recompute current hash from canonical data
            String canonical = canonical(logEntry.getSequence(), logEntry.getActor(), logEntry.getAction(),
                    logEntry.getInvestigationId(), logEntry.getDocumentId(), logEntry.getEvidenceId(),
                    logEntry.getResult(), logEntry.getDescription(), logEntry.getTimestamp(),
                    logEntry.getPreviousHash());
            String recomputed = HashUtil.sha256(canonical);
            if (!recomputed.equals(logEntry.getCurrentHash())) {
                return AuditChainVerifyResponse.builder()
                        .valid(false)
                        .recordsChecked(logs.size())
                        .firstBrokenRecordId(logEntry.getId())
                        .firstBrokenSequence(logEntry.getSequence())
                        .message("Content hash mismatch at sequence " + logEntry.getSequence())
                        .build();
            }
            expectedPrev = logEntry.getCurrentHash();
        }
        return AuditChainVerifyResponse.builder()
                .valid(true)
                .recordsChecked(logs.size())
                .message("Audit chain is valid")
                .build();
    }

    public AuditLogResponse toResponse(AuditLog a) {
        return AuditLogResponse.builder()
                .id(a.getId())
                .actor(a.getActor())
                .actorRole(a.getActorRole())
                .action(a.getAction())
                .investigationId(a.getInvestigationId())
                .documentId(a.getDocumentId())
                .evidenceId(a.getEvidenceId())
                .result(a.getResult())
                .description(a.getDescription())
                .previousHash(a.getPreviousHash())
                .currentHash(a.getCurrentHash())
                .sequence(a.getSequence())
                .timestamp(a.getTimestamp())
                .build();
    }
}
