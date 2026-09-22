package com.astrax.legal.repository;

import com.astrax.legal.model.EvidenceEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends MongoRepository<EvidenceEntity, String> {
    List<EvidenceEntity> findByCaseId(String caseId);
    Optional<EvidenceEntity> findByEvidenceId(String evidenceId);
    Optional<EvidenceEntity> findBySealNumber(String sealNumber);
    List<EvidenceEntity> findByCurrentCustodianId(String custodianId);
}
