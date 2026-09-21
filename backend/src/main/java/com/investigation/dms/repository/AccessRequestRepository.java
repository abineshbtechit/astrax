package com.investigation.dms.repository;

import com.investigation.dms.common.enums.RequestStatus;
import com.investigation.dms.model.AccessRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccessRequestRepository extends MongoRepository<AccessRequest, String> {
    List<AccessRequest> findByDocumentId(String documentId);
    List<AccessRequest> findByRequesterId(String requesterId);
    List<AccessRequest> findByStatus(RequestStatus status);
}
