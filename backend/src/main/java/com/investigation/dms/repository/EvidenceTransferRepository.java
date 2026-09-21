package com.investigation.dms.repository;

import com.investigation.dms.model.EvidenceTransfer;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvidenceTransferRepository extends MongoRepository<EvidenceTransfer, String> {
    List<EvidenceTransfer> findByEvidenceIdOrderByCreatedAtAsc(String evidenceId);
}
