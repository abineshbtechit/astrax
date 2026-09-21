package com.investigation.dms.repository;

import com.investigation.dms.common.enums.Classification;
import com.investigation.dms.common.enums.DocumentType;
import com.investigation.dms.model.DocumentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    List<DocumentEntity> findByInvestigationId(String investigationId);
    List<DocumentEntity> findByOwnerUserId(String ownerUserId);
    List<DocumentEntity> findByOwnerDepartmentId(String ownerDepartmentId);
    List<DocumentEntity> findByType(DocumentType type);
    List<DocumentEntity> findByClassification(Classification classification);
    long countByInvestigationId(String investigationId);
}
