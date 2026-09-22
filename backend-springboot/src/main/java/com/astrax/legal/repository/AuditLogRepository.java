package com.astrax.legal.repository;

import com.astrax.legal.model.AuditLogEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends MongoRepository<AuditLogEntity, String> {
    List<AuditLogEntity> findByCaseId(String caseId);
    List<AuditLogEntity> findByResourceId(String resourceId);
    List<AuditLogEntity> findByActorId(String actorId);
}
