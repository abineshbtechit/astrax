package com.astrax.legal.repository;

import com.astrax.legal.model.DocumentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    List<DocumentEntity> findByCaseId(String caseId);
    List<DocumentEntity> findByOwnerDepartment(String ownerDepartment);
    Optional<DocumentEntity> findBySha256Hash(String sha256Hash);
    List<DocumentEntity> findByTamperState(String tamperState);
}
