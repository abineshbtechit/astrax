package com.astrax.legal.repository;

import com.astrax.legal.model.AccessRequestEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AccessRequestRepository extends MongoRepository<AccessRequestEntity, String> {
    List<AccessRequestEntity> findByDocumentId(String documentId);
    List<AccessRequestEntity> findByRequesterId(String requesterId);
    List<AccessRequestEntity> findByOwnerDepartment(String ownerDepartment);
    List<AccessRequestEntity> findByStatus(String status);
}
