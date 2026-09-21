package com.investigation.dms.repository;

import com.investigation.dms.model.DigitalSignature;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalSignatureRepository extends MongoRepository<DigitalSignature, String> {
    List<DigitalSignature> findByDocumentId(String documentId);
}
