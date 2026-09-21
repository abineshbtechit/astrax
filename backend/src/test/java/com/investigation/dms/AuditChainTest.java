package com.investigation.dms;

import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.dto.misc.AuditChainVerifyResponse;
import com.investigation.dms.model.AuditLog;
import com.investigation.dms.repository.AuditLogRepository;
import com.investigation.dms.service.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit test for the chained audit hash logic using an in-memory fake repository,
 * so no MongoDB is needed. Verifies both a valid chain and tamper detection.
 */
class AuditChainTest {

    private AuditService auditService;
    private InMemoryAuditRepo repo;

    @BeforeEach
    void setup() {
        repo = new InMemoryAuditRepo();
        auditService = new AuditService(repo);
    }

    @Test
    void validChainVerifies() {
        auditService.record("alice", "ADMIN", AuditAction.LOGIN, "login");
        auditService.record("bob", "POLICE_OFFICER", AuditAction.CASE_CREATED, "created case");
        auditService.record("carol", "FORENSIC_OFFICER", AuditAction.DOCUMENT_UPLOADED, "uploaded");

        AuditChainVerifyResponse result = auditService.verifyChain();
        assertTrue(result.isValid());
        assertEquals(3, result.getRecordsChecked());
    }

    @Test
    void tamperedRecordIsDetected() {
        auditService.record("alice", "ADMIN", AuditAction.LOGIN, "login");
        auditService.record("bob", "POLICE_OFFICER", AuditAction.CASE_CREATED, "created case");

        // Tamper with the first record's description after the fact.
        AuditLog first = repo.findAllByOrderBySequenceAsc().get(0);
        first.setDescription("tampered description");

        AuditChainVerifyResponse result = auditService.verifyChain();
        assertFalse(result.isValid());
        assertEquals(1L, result.getFirstBrokenSequence());
    }

    /**
     * Minimal in-memory implementation of the subset of AuditLogRepository used by AuditService.
     */
    static class InMemoryAuditRepo implements AuditLogRepository {
        private final List<AuditLog> store = new ArrayList<>();
        private int idSeq = 0;

        @Override
        public List<AuditLog> findAllByOrderBySequenceAsc() {
            store.sort((a, b) -> Long.compare(a.getSequence(), b.getSequence()));
            return store;
        }

        @Override
        public Optional<AuditLog> findTopByOrderBySequenceDesc() {
            return store.stream().max((a, b) -> Long.compare(a.getSequence(), b.getSequence()));
        }

        @Override
        public <S extends AuditLog> S save(S entity) {
            if (entity.getId() == null) {
                entity.setId("audit-" + (++idSeq));
            }
            store.removeIf(a -> a.getId().equals(entity.getId()));
            store.add(entity);
            return entity;
        }

        // ---- Unused repository methods ----
        @Override public List<AuditLog> findByActor(String actor) { return List.of(); }
        @Override public List<AuditLog> findByInvestigationId(String id) { return List.of(); }
        @Override public List<AuditLog> findByDocumentId(String id) { return List.of(); }
        @Override public <S extends AuditLog> List<S> saveAll(Iterable<S> entities) {
            List<S> r = new ArrayList<>(); entities.forEach(e -> r.add(save(e))); return r; }
        @Override public Optional<AuditLog> findById(String s) {
            return store.stream().filter(a -> a.getId().equals(s)).findFirst(); }
        @Override public boolean existsById(String s) { return findById(s).isPresent(); }
        @Override public List<AuditLog> findAll() { return store; }
        @Override public List<AuditLog> findAllById(Iterable<String> ids) { return List.of(); }
        @Override public long count() { return store.size(); }
        @Override public void deleteById(String s) { store.removeIf(a -> a.getId().equals(s)); }
        @Override public void delete(AuditLog entity) { store.remove(entity); }
        @Override public void deleteAllById(Iterable<? extends String> ids) { }
        @Override public void deleteAll(Iterable<? extends AuditLog> entities) { }
        @Override public void deleteAll() { store.clear(); }
        @Override public List<AuditLog> findAll(org.springframework.data.domain.Sort sort) { return store; }
        @Override public org.springframework.data.domain.Page<AuditLog> findAll(org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends AuditLog> S insert(S entity) { return save(entity); }
        @Override public <S extends AuditLog> List<S> insert(Iterable<S> entities) { return saveAll(entities); }
        @Override public <S extends AuditLog> Optional<S> findOne(org.springframework.data.domain.Example<S> example) { return Optional.empty(); }
        @Override public <S extends AuditLog> List<S> findAll(org.springframework.data.domain.Example<S> example) { return List.of(); }
        @Override public <S extends AuditLog> List<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Sort sort) { return List.of(); }
        @Override public <S extends AuditLog> org.springframework.data.domain.Page<S> findAll(org.springframework.data.domain.Example<S> example, org.springframework.data.domain.Pageable pageable) { return org.springframework.data.domain.Page.empty(); }
        @Override public <S extends AuditLog> long count(org.springframework.data.domain.Example<S> example) { return 0; }
        @Override public <S extends AuditLog> boolean exists(org.springframework.data.domain.Example<S> example) { return false; }
        @Override public <S extends AuditLog, R> R findBy(org.springframework.data.domain.Example<S> example, java.util.function.Function<org.springframework.data.repository.query.FluentQuery.FetchableFluentQuery<S>, R> queryFunction) { return null; }
    }
}
