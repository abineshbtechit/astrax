package com.investigation.dms.repository;

import com.investigation.dms.model.Evidence;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends MongoRepository<Evidence, String> {
    List<Evidence> findByInvestigationId(String investigationId);
    List<Evidence> findByCurrentCustodian(String currentCustodian);
    Optional<Evidence> findByEvidenceId(String evidenceId);
    boolean existsByEvidenceId(String evidenceId);
}
