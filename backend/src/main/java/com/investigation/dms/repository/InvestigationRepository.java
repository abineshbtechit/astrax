package com.investigation.dms.repository;

import com.investigation.dms.common.enums.CaseStatus;
import com.investigation.dms.model.Investigation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestigationRepository extends MongoRepository<Investigation, String> {
    Optional<Investigation> findByCaseNumber(String caseNumber);
    boolean existsByCaseNumber(String caseNumber);
    List<Investigation> findByStatus(CaseStatus status);
    List<Investigation> findByOwnerDepartmentId(String ownerDepartmentId);
    long countByStatus(CaseStatus status);
}
