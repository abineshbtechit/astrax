package com.investigation.dms.repository;

import com.investigation.dms.model.InvestigationMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvestigationMemberRepository extends MongoRepository<InvestigationMember, String> {
    List<InvestigationMember> findByInvestigationId(String investigationId);
    List<InvestigationMember> findByUserId(String userId);
    Optional<InvestigationMember> findByInvestigationIdAndUserId(String investigationId, String userId);
    boolean existsByInvestigationIdAndUserId(String investigationId, String userId);
}
