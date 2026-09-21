package com.investigation.dms.repository;

import com.investigation.dms.model.AuditLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLog, String> {
    List<AuditLog> findByActor(String actor);
    List<AuditLog> findByInvestigationId(String investigationId);
    List<AuditLog> findByDocumentId(String documentId);
    List<AuditLog> findAllByOrderBySequenceAsc();
    Optional<AuditLog> findTopByOrderBySequenceDesc();
}
