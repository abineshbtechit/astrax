package com.investigation.dms.repository;

import com.investigation.dms.model.CaseRelationship;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseRelationshipRepository extends MongoRepository<CaseRelationship, String> {
    List<CaseRelationship> findByInvestigationId(String investigationId);
}
