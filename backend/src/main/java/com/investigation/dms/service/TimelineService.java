package com.investigation.dms.service;

import com.investigation.dms.dto.misc.TimelineEventResponse;
import com.investigation.dms.model.TimelineEvent;
import com.investigation.dms.repository.TimelineEventRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class TimelineService {

    private final TimelineEventRepository repository;

    public TimelineService(TimelineEventRepository repository) {
        this.repository = repository;
    }

    public TimelineEvent add(String investigationId, String eventType, String title, String description,
                             String actor, String actorRole, String relatedDocumentId, String relatedEvidenceId) {
        TimelineEvent event = TimelineEvent.builder()
                .investigationId(investigationId)
                .eventType(eventType)
                .title(title)
                .description(description)
                .actor(actor)
                .actorRole(actorRole)
                .timestamp(Instant.now())
                .relatedDocumentId(relatedDocumentId)
                .relatedEvidenceId(relatedEvidenceId)
                .build();
        return repository.save(event);
    }

    public List<TimelineEventResponse> forInvestigation(String investigationId) {
        return repository.findByInvestigationIdOrderByTimestampAsc(investigationId).stream()
                .map(this::toResponse)
                .toList();
    }

    public TimelineEventResponse toResponse(TimelineEvent e) {
        return TimelineEventResponse.builder()
                .id(e.getId())
                .investigationId(e.getInvestigationId())
                .eventType(e.getEventType())
                .title(e.getTitle())
                .description(e.getDescription())
                .actor(e.getActor())
                .actorRole(e.getActorRole())
                .timestamp(e.getTimestamp())
                .relatedDocumentId(e.getRelatedDocumentId())
                .relatedEvidenceId(e.getRelatedEvidenceId())
                .build();
    }
}
