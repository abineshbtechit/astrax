package com.astrax.legal.repository;

import com.astrax.legal.model.CaseEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CaseRepository extends MongoRepository<CaseEntity, String> {
    Optional<CaseEntity> findByCaseNumber(String caseNumber);
    List<CaseEntity> findByOwnerDepartment(String ownerDepartment);
    List<CaseEntity> findByStatus(String status);
}
