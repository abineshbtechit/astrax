package com.investigation.dms.repository;

import com.investigation.dms.model.TimelineEvent;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineEventRepository extends MongoRepository<TimelineEvent, String> {
    List<TimelineEvent> findByInvestigationIdOrderByTimestampAsc(String investigationId);
}
