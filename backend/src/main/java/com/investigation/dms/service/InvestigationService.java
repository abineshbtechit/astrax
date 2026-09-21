package com.investigation.dms.service;

import com.investigation.dms.common.enums.AccessLevel;
import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.enums.CaseStatus;
import com.investigation.dms.common.enums.NotificationType;
import com.investigation.dms.common.enums.Role;
import com.investigation.dms.common.exception.AccessDeniedApiException;
import com.investigation.dms.common.exception.ConflictException;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.investigation.AddMemberRequest;
import com.investigation.dms.dto.investigation.CaseResponse;
import com.investigation.dms.dto.investigation.CreateCaseRequest;
import com.investigation.dms.dto.investigation.MemberResponse;
import com.investigation.dms.dto.investigation.TimelineEventRequest;
import com.investigation.dms.dto.investigation.UpdateCaseRequest;
import com.investigation.dms.dto.misc.RelationshipResponse;
import com.investigation.dms.dto.misc.TimelineEventResponse;
import com.investigation.dms.model.CaseRelationship;
import com.investigation.dms.model.Investigation;
import com.investigation.dms.model.InvestigationMember;
import com.investigation.dms.model.User;
import com.investigation.dms.repository.CaseRelationshipRepository;
import com.investigation.dms.repository.DocumentRepository;
import com.investigation.dms.repository.EvidenceRepository;
import com.investigation.dms.repository.InvestigationMemberRepository;
import com.investigation.dms.repository.InvestigationRepository;
import com.investigation.dms.repository.UserRepository;
import com.investigation.dms.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@Service
public class InvestigationService {

    private final InvestigationRepository investigationRepository;
    private final InvestigationMemberRepository memberRepository;
    private final CaseRelationshipRepository relationshipRepository;
    private final DocumentRepository documentRepository;
    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControl;
    private final AuditService auditService;
    private final TimelineService timelineService;
    private final NotificationService notificationService;

    public InvestigationService(InvestigationRepository investigationRepository,
                                InvestigationMemberRepository memberRepository,
                                CaseRelationshipRepository relationshipRepository,
                                DocumentRepository documentRepository,
                                EvidenceRepository evidenceRepository,
                                UserRepository userRepository,
                                AccessControlService accessControl,
                                AuditService auditService,
                                TimelineService timelineService,
                                NotificationService notificationService) {
        this.investigationRepository = investigationRepository;
        this.memberRepository = memberRepository;
        this.relationshipRepository = relationshipRepository;
        this.documentRepository = documentRepository;
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
        this.accessControl = accessControl;
        this.auditService = auditService;
        this.timelineService = timelineService;
        this.notificationService = notificationService;
    }

    public CaseResponse create(CreateCaseRequest request, UserPrincipal principal) {
        if (!accessControl.hasAnyRole(principal, Role.ADMIN, Role.POLICE_OFFICER, Role.INVESTIGATION_OFFICER)) {
            throw new AccessDeniedApiException("Not authorized to create investigations");
        }

        String caseNumber = StringUtils.hasText(request.getCaseNumber())
                ? request.getCaseNumber() : generateCaseNumber();
        if (investigationRepository.existsByCaseNumber(caseNumber)) {
            throw new ConflictException("Case number already exists");
        }

        String ownerDept = StringUtils.hasText(request.getOwnerDepartmentId())
                ? request.getOwnerDepartmentId() : principal.getDepartmentId();

        Investigation investigation = Investigation.builder()
                .caseNumber(caseNumber)
                .title(request.getTitle())
                .crimeType(request.getCrimeType())
                .description(request.getDescription())
                .location(request.getLocation())
                .priority(request.getPriority())
                .status(CaseStatus.UNDER_INVESTIGATION)
                .ownerDepartmentId(ownerDept)
                .createdBy(principal.getId())
                .investigatingOfficer(StringUtils.hasText(request.getInvestigatingOfficer())
                        ? request.getInvestigatingOfficer() : principal.getId())
                .participatingDepartmentIds(request.getParticipatingDepartmentIds() != null
                        ? request.getParticipatingDepartmentIds() : new ArrayList<>())
                .statusHistory(new ArrayList<>(List.of(Investigation.StatusHistoryEntry.builder()
                        .status(CaseStatus.UNDER_INVESTIGATION)
                        .changedBy(principal.getId())
                        .changedAt(Instant.now())
                        .note("Case created")
                        .build())))
                .build();
        investigation = investigationRepository.save(investigation);

        // Creator becomes CASE_OWNER member.
        memberRepository.save(InvestigationMember.builder()
                .investigationId(investigation.getId())
                .userId(principal.getId())
                .departmentId(principal.getDepartmentId())
                .accessLevel(AccessLevel.CASE_OWNER)
                .assignedBy(principal.getId())
                .assignedAt(Instant.now())
                .build());

        timelineService.add(investigation.getId(), "CASE_CREATED", "Investigation created",
                "Case " + caseNumber + " opened", principal.getUsername(), firstRole(principal), null, null);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.CASE_CREATED,
                investigation.getId(), null, null, "SUCCESS", "Created case " + caseNumber, null, null);

        return toResponse(investigation);
    }

    public List<CaseResponse> list(UserPrincipal principal) {
        return investigationRepository.findAll().stream()
                .filter(inv -> accessControl.canViewCase(principal, inv))
                .map(this::toResponse)
                .toList();
    }

    public CaseResponse get(String id, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseView(principal, inv);
        return toResponse(inv);
    }

    public Investigation require(String id) {
        return investigationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation not found"));
    }

    public CaseResponse update(String id, UpdateCaseRequest request, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseWrite(principal, inv);

        if (StringUtils.hasText(request.getTitle())) {
            inv.setTitle(request.getTitle());
        }
        if (StringUtils.hasText(request.getCrimeType())) {
            inv.setCrimeType(request.getCrimeType());
        }
        if (request.getDescription() != null) {
            inv.setDescription(request.getDescription());
        }
        if (request.getLocation() != null) {
            inv.setLocation(request.getLocation());
        }
        if (request.getPriority() != null) {
            inv.setPriority(request.getPriority());
        }
        if (request.getInvestigatingOfficer() != null) {
            inv.setInvestigatingOfficer(request.getInvestigatingOfficer());
        }
        if (request.getParticipatingDepartmentIds() != null) {
            inv.setParticipatingDepartmentIds(request.getParticipatingDepartmentIds());
        }

        boolean statusChanged = false;
        if (request.getStatus() != null && request.getStatus() != inv.getStatus()) {
            inv.setStatus(request.getStatus());
            inv.getStatusHistory().add(Investigation.StatusHistoryEntry.builder()
                    .status(request.getStatus())
                    .changedBy(principal.getId())
                    .changedAt(Instant.now())
                    .note(request.getStatusNote())
                    .build());
            statusChanged = true;
        }

        inv = investigationRepository.save(inv);

        if (statusChanged) {
            timelineService.add(inv.getId(), "CASE_STATUS_CHANGED", "Status changed to " + inv.getStatus(),
                    request.getStatusNote(), principal.getUsername(), firstRole(principal), null, null);
            auditService.record(principal.getUsername(), firstRole(principal), AuditAction.CASE_STATUS_CHANGED,
                    inv.getId(), null, null, "SUCCESS", "Status -> " + inv.getStatus(), null, null);
        } else {
            auditService.record(principal.getUsername(), firstRole(principal), AuditAction.CASE_UPDATED,
                    inv.getId(), null, null, "SUCCESS", "Case updated", null, null);
        }

        return toResponse(inv);
    }

    public MemberResponse addMember(String id, AddMemberRequest request, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseWrite(principal, inv);

        User target = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Target user not found"));

        if (memberRepository.existsByInvestigationIdAndUserId(id, request.getUserId())) {
            throw new ConflictException("User is already a member of this investigation");
        }

        InvestigationMember member = memberRepository.save(InvestigationMember.builder()
                .investigationId(id)
                .userId(request.getUserId())
                .departmentId(StringUtils.hasText(request.getDepartmentId())
                        ? request.getDepartmentId() : target.getDepartmentId())
                .accessLevel(request.getAccessLevel())
                .assignedBy(principal.getId())
                .assignedAt(Instant.now())
                .build());

        // Add participating department if new.
        String dept = member.getDepartmentId();
        if (dept != null && !dept.equals(inv.getOwnerDepartmentId())
                && !inv.getParticipatingDepartmentIds().contains(dept)) {
            inv.getParticipatingDepartmentIds().add(dept);
            investigationRepository.save(inv);
        }

        timelineService.add(id, "MEMBER_ASSIGNED", "Member assigned",
                target.getUsername() + " assigned as " + request.getAccessLevel(),
                principal.getUsername(), firstRole(principal), null, null);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.MEMBER_ASSIGNED,
                id, null, null, "SUCCESS", "Assigned " + target.getUsername(), null, null);

        notificationService.notify(target.getId(), "Assigned to investigation",
                "You have been assigned to case " + inv.getCaseNumber(),
                NotificationType.ASSIGNMENT, "/cases/" + id);

        return toMemberResponse(member, target);
    }

    public List<MemberResponse> members(String id, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseView(principal, inv);
        return memberRepository.findByInvestigationId(id).stream()
                .map(m -> {
                    User u = userRepository.findById(m.getUserId()).orElse(null);
                    return toMemberResponse(m, u);
                })
                .toList();
    }

    // --------------------------- Timeline ---------------------------

    public List<TimelineEventResponse> timeline(String id, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseView(principal, inv);
        return timelineService.forInvestigation(id);
    }

    public TimelineEventResponse addTimelineEvent(String id, TimelineEventRequest request, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseWrite(principal, inv);
        var event = timelineService.add(id, request.getEventType(), request.getTitle(), request.getDescription(),
                principal.getUsername(), firstRole(principal), request.getRelatedDocumentId(),
                request.getRelatedEvidenceId());
        return timelineService.toResponse(event);
    }

    // --------------------------- Relationships ---------------------------

    public RelationshipResponse relationships(String id, UserPrincipal principal) {
        Investigation inv = require(id);
        accessControl.requireCaseView(principal, inv);

        List<CaseRelationship> rels = relationshipRepository.findByInvestigationId(id);
        List<RelationshipResponse.GraphNode> nodes = new ArrayList<>();
        List<RelationshipResponse.GraphEdge> edges = new ArrayList<>();
        java.util.Set<String> seen = new java.util.HashSet<>();

        for (CaseRelationship rel : rels) {
            addNode(nodes, seen, rel.getSourceNode());
            addNode(nodes, seen, rel.getTargetNode());
            edges.add(RelationshipResponse.GraphEdge.builder()
                    .id(rel.getId())
                    .source(nodeId(rel.getSourceNode()))
                    .target(nodeId(rel.getTargetNode()))
                    .relationshipType(rel.getRelationshipType())
                    .properties(rel.getProperties())
                    .build());
        }
        return RelationshipResponse.builder().nodes(nodes).edges(edges).build();
    }

    private void addNode(List<RelationshipResponse.GraphNode> nodes, java.util.Set<String> seen,
                         CaseRelationship.Node node) {
        if (node == null) {
            return;
        }
        String nid = nodeId(node);
        if (seen.add(nid)) {
            nodes.add(RelationshipResponse.GraphNode.builder()
                    .id(nid)
                    .nodeType(node.getNodeType() == null ? null : node.getNodeType().name())
                    .label(node.getLabel())
                    .build());
        }
    }

    private String nodeId(CaseRelationship.Node node) {
        return node.getNodeType() + ":" + node.getRefId();
    }

    // --------------------------- Helpers ---------------------------

    private String generateCaseNumber() {
        String base = "CASE-" + Year.now();
        String candidate;
        do {
            int rand = (int) (Math.random() * 100000);
            candidate = base + "-" + String.format("%05d", rand);
        } while (investigationRepository.existsByCaseNumber(candidate));
        return candidate;
    }

    public CaseResponse toResponse(Investigation inv) {
        return CaseResponse.builder()
                .id(inv.getId())
                .caseNumber(inv.getCaseNumber())
                .title(inv.getTitle())
                .crimeType(inv.getCrimeType())
                .description(inv.getDescription())
                .location(inv.getLocation())
                .status(inv.getStatus())
                .priority(inv.getPriority())
                .ownerDepartmentId(inv.getOwnerDepartmentId())
                .createdBy(inv.getCreatedBy())
                .investigatingOfficer(inv.getInvestigatingOfficer())
                .participatingDepartmentIds(inv.getParticipatingDepartmentIds())
                .documentCount(documentRepository.countByInvestigationId(inv.getId()))
                .evidenceCount(evidenceRepository.findByInvestigationId(inv.getId()).size())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }

    private MemberResponse toMemberResponse(InvestigationMember m, User u) {
        return MemberResponse.builder()
                .id(m.getId())
                .investigationId(m.getInvestigationId())
                .userId(m.getUserId())
                .userFullName(u == null ? null : u.getFullName())
                .departmentId(m.getDepartmentId())
                .accessLevel(m.getAccessLevel())
                .assignedAt(m.getAssignedAt())
                .build();
    }

    private String firstRole(UserPrincipal principal) {
        return principal.getRoleNames().isEmpty() ? null : principal.getRoleNames().get(0);
    }
}
