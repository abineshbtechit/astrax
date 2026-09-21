package com.investigation.dms.repository;

import com.investigation.dms.common.enums.GrantStatus;
import com.investigation.dms.model.DocumentAccessGrant;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentAccessGrantRepository extends MongoRepository<DocumentAccessGrant, String> {
    List<DocumentAccessGrant> findByDocumentId(String documentId);
    List<DocumentAccessGrant> findByDocumentIdAndStatus(String documentId, GrantStatus status);
    List<DocumentAccessGrant> findByGranteeIdAndStatus(String granteeId, GrantStatus status);
    List<DocumentAccessGrant> findByStatus(GrantStatus status);
}
