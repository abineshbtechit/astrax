package com.investigation.dms.service;

import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.enums.GrantStatus;
import com.investigation.dms.common.enums.GranteeType;
import com.investigation.dms.common.enums.NotificationType;
import com.investigation.dms.common.enums.Permission;
import com.investigation.dms.common.enums.RequestStatus;
import com.investigation.dms.common.exception.AccessDeniedApiException;
import com.investigation.dms.common.exception.BusinessValidationException;
import com.investigation.dms.common.exception.ResourceNotFoundException;
import com.investigation.dms.dto.share.AccessRequestDto;
import com.investigation.dms.dto.share.AccessRequestResponse;
import com.investigation.dms.dto.share.DecisionRequest;
import com.investigation.dms.dto.share.ShareRequest;
import com.investigation.dms.dto.share.ShareResponse;
import com.investigation.dms.model.AccessRequest;
import com.investigation.dms.model.DocumentAccessGrant;
import com.investigation.dms.model.DocumentEntity;
import com.investigation.dms.repository.AccessRequestRepository;
import com.investigation.dms.repository.DocumentAccessGrantRepository;
import com.investigation.dms.security.UserPrincipal;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;

/**
 * Cross-department sharing: access grants, revocation, access requests and
 * approvals (FR-SHARE-001..007, SRS section 16).
 */
@Service
public class ShareService {

    private final DocumentAccessGrantRepository grantRepository;
    private final AccessRequestRepository requestRepository;
    private final DocumentService documentService;
    private final AccessControlService accessControl;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public ShareService(DocumentAccessGrantRepository grantRepository,
                        AccessRequestRepository requestRepository,
                        DocumentService documentService,
                        AccessControlService accessControl,
                        AuditService auditService,
                        NotificationService notificationService) {
        this.grantRepository = grantRepository;
        this.requestRepository = requestRepository;
        this.documentService = documentService;
        this.accessControl = accessControl;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    // --------------------------- Grants ---------------------------

    public ShareResponse share(String documentId, ShareRequest request, UserPrincipal principal) {
        DocumentEntity doc = documentService.require(documentId);
        accessControl.requireShare(principal, doc);

        DocumentAccessGrant grant = DocumentAccessGrant.builder()
                .documentId(documentId)
                .granteeType(request.getGranteeType())
                .granteeId(request.getGranteeId())
                .permissions(new HashSet<>(request.getPermissions()))
                .purpose(request.getPurpose())
                .startAt(request.getStartAt())
                .expiresAt(request.getExpiresAt())
                .status(GrantStatus.ACTIVE)
                .grantedBy(principal.getId())
                .approvedBy(principal.getId())
                .build();
        grant = grantRepository.save(grant);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.DOCUMENT_SHARED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS",
                "Shared with " + request.getGranteeType() + ":" + request.getGranteeId(), null, null);

        if (request.getGranteeType() == GranteeType.USER) {
            notificationService.notify(request.getGranteeId(), "Document shared with you",
                    "You have been granted access to '" + doc.getDocumentName() + "'",
                    NotificationType.SHARE, "/documents/" + documentId);
        }

        return toResponse(grant);
    }

    public List<ShareResponse> shares(String documentId, UserPrincipal principal) {
        DocumentEntity doc = documentService.require(documentId);
        accessControl.requireShare(principal, doc);
        return grantRepository.findByDocumentId(documentId).stream().map(this::toResponse).toList();
    }

    public void revoke(String documentId, String shareId, UserPrincipal principal) {
        DocumentEntity doc = documentService.require(documentId);
        accessControl.requireShare(principal, doc);

        DocumentAccessGrant grant = grantRepository.findById(shareId)
                .orElseThrow(() -> new ResourceNotFoundException("Grant not found"));
        if (!grant.getDocumentId().equals(documentId)) {
            throw new BusinessValidationException("Grant does not belong to this document");
        }
        grant.setStatus(GrantStatus.REVOKED);
        grant.setRevokedBy(principal.getId());
        grant.setRevokedAt(Instant.now());
        grantRepository.save(grant);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.SHARE_REVOKED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS", "Revoked grant " + shareId, null, null);

        if (grant.getGranteeType() == GranteeType.USER) {
            notificationService.notify(grant.getGranteeId(), "Access revoked",
                    "Your access to '" + doc.getDocumentName() + "' has been revoked",
                    NotificationType.SHARE, "/documents/" + documentId);
        }
    }

    // --------------------------- Access requests ---------------------------

    public AccessRequestResponse requestAccess(AccessRequestDto dto, UserPrincipal principal) {
        DocumentEntity doc = documentService.require(dto.getDocumentId());

        AccessRequest req = AccessRequest.builder()
                .documentId(dto.getDocumentId())
                .requesterId(principal.getId())
                .requestedPermissions(new HashSet<>(dto.getRequestedPermissions()))
                .reason(dto.getReason())
                .status(RequestStatus.PENDING)
                .build();
        req = requestRepository.save(req);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.ACCESS_REQUESTED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS",
                "Requested access: " + dto.getRequestedPermissions(), null, null);

        // Notify the document owner.
        if (doc.getOwnerUserId() != null) {
            notificationService.notify(doc.getOwnerUserId(), "Access request",
                    principal.getUsername() + " requested access to '" + doc.getDocumentName() + "'",
                    NotificationType.ACCESS_REQUEST, "/documents/" + doc.getId());
        }

        return toRequestResponse(req);
    }

    public AccessRequestResponse approveRequest(String requestId, DecisionRequest decision, UserPrincipal principal) {
        AccessRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));
        DocumentEntity doc = documentService.require(req.getDocumentId());
        if (!accessControl.canShare(principal, doc)) {
            throw new AccessDeniedApiException("Not authorized to decide this access request");
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            throw new BusinessValidationException("Access request is already decided");
        }

        req.setStatus(RequestStatus.APPROVED);
        req.setReviewerId(principal.getId());
        req.setDecisionNote(decision == null ? null : decision.getNote());
        req.setDecidedAt(Instant.now());
        req = requestRepository.save(req);

        // Create the corresponding active grant.
        DocumentAccessGrant grant = grantRepository.save(DocumentAccessGrant.builder()
                .documentId(req.getDocumentId())
                .granteeType(GranteeType.USER)
                .granteeId(req.getRequesterId())
                .permissions(new HashSet<>(req.getRequestedPermissions()))
                .purpose(req.getReason())
                .startAt(Instant.now())
                .expiresAt(decision == null ? null : decision.getExpiresAt())
                .status(GrantStatus.ACTIVE)
                .grantedBy(principal.getId())
                .approvedBy(principal.getId())
                .build());

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.ACCESS_REQUEST_APPROVED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS",
                "Approved access request " + requestId, null, null);

        notificationService.notify(req.getRequesterId(), "Access approved",
                "Your access request for '" + doc.getDocumentName() + "' was approved",
                NotificationType.APPROVAL, "/documents/" + doc.getId());

        return toRequestResponse(req);
    }

    public AccessRequestResponse rejectRequest(String requestId, DecisionRequest decision, UserPrincipal principal) {
        AccessRequest req = requestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Access request not found"));
        DocumentEntity doc = documentService.require(req.getDocumentId());
        if (!accessControl.canShare(principal, doc)) {
            throw new AccessDeniedApiException("Not authorized to decide this access request");
        }
        if (req.getStatus() != RequestStatus.PENDING) {
            throw new BusinessValidationException("Access request is already decided");
        }

        req.setStatus(RequestStatus.REJECTED);
        req.setReviewerId(principal.getId());
        req.setDecisionNote(decision == null ? null : decision.getNote());
        req.setDecidedAt(Instant.now());
        req = requestRepository.save(req);

        auditService.record(principal.getUsername(), firstRole(principal), AuditAction.ACCESS_REQUEST_REJECTED,
                doc.getInvestigationId(), doc.getId(), null, "SUCCESS",
                "Rejected access request " + requestId, null, null);

        notificationService.notify(req.getRequesterId(), "Access rejected",
                "Your access request for '" + doc.getDocumentName() + "' was rejected",
                NotificationType.APPROVAL, "/documents/" + doc.getId());

        return toRequestResponse(req);
    }

    public List<AccessRequestResponse> requestsForDocument(String documentId, UserPrincipal principal) {
        DocumentEntity doc = documentService.require(documentId);
        accessControl.requireShare(principal, doc);
        return requestRepository.findByDocumentId(documentId).stream().map(this::toRequestResponse).toList();
    }

    // --------------------------- Mapping ---------------------------

    private ShareResponse toResponse(DocumentAccessGrant g) {
        return ShareResponse.builder()
                .id(g.getId())
                .documentId(g.getDocumentId())
                .granteeType(g.getGranteeType())
                .granteeId(g.getGranteeId())
                .permissions(g.getPermissions())
                .purpose(g.getPurpose())
                .startAt(g.getStartAt())
                .expiresAt(g.getExpiresAt())
                .status(g.getStatus())
                .grantedBy(g.getGrantedBy())
                .approvedBy(g.getApprovedBy())
                .createdAt(g.getCreatedAt())
                .build();
    }

    private AccessRequestResponse toRequestResponse(AccessRequest r) {
        return AccessRequestResponse.builder()
                .id(r.getId())
                .documentId(r.getDocumentId())
                .requesterId(r.getRequesterId())
                .requestedPermissions(r.getRequestedPermissions())
                .reason(r.getReason())
                .status(r.getStatus())
                .reviewerId(r.getReviewerId())
                .decisionNote(r.getDecisionNote())
                .decidedAt(r.getDecidedAt())
                .createdAt(r.getCreatedAt())
                .build();
    }

    private String firstRole(UserPrincipal principal) {
        return principal.getRoleNames().isEmpty() ? null : principal.getRoleNames().get(0);
    }
}
