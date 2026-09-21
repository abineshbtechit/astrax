package com.investigation.dms.service;

import com.investigation.dms.common.enums.AccessLevel;
import com.investigation.dms.common.enums.AlertSeverity;
import com.investigation.dms.common.enums.AlertType;
import com.investigation.dms.common.enums.AuditAction;
import com.investigation.dms.common.enums.Classification;
import com.investigation.dms.common.enums.GrantStatus;
import com.investigation.dms.common.enums.GranteeType;
import com.investigation.dms.common.enums.Permission;
import com.investigation.dms.common.enums.Role;
import com.investigation.dms.common.exception.AccessDeniedApiException;
import com.investigation.dms.model.DocumentAccessGrant;
import com.investigation.dms.model.DocumentEntity;
import com.investigation.dms.model.Investigation;
import com.investigation.dms.model.InvestigationMember;
import com.investigation.dms.repository.DocumentAccessGrantRepository;
import com.investigation.dms.repository.InvestigationMemberRepository;
import com.investigation.dms.repository.InvestigationRepository;
import com.investigation.dms.security.UserPrincipal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * Central cross-department access-control evaluator (SRS section 16, section 7).
 *
 * <p>A user's role alone is never sufficient. Access to an investigation or document
 * is derived from: role, department, investigation membership, document
 * classification, ownership, explicit access grants and workflow state. All checks
 * are performed server-side before any metadata or binary content is returned.
 */
@Slf4j
@Service
public class AccessControlService {

    private final InvestigationRepository investigationRepository;
    private final InvestigationMemberRepository memberRepository;
    private final DocumentAccessGrantRepository grantRepository;
    private final AuditService auditService;
    private final SecurityAlertService securityAlertService;

    public AccessControlService(InvestigationRepository investigationRepository,
                                InvestigationMemberRepository memberRepository,
                                DocumentAccessGrantRepository grantRepository,
                                AuditService auditService,
                                SecurityAlertService securityAlertService) {
        this.investigationRepository = investigationRepository;
        this.memberRepository = memberRepository;
        this.grantRepository = grantRepository;
        this.auditService = auditService;
        this.securityAlertService = securityAlertService;
    }

    // ---------------------------------------------------------------------
    // Role helpers
    // ---------------------------------------------------------------------

    public boolean isAdmin(UserPrincipal principal) {
        return principal.getRoles().contains(Role.ADMIN);
    }

    public boolean isAuditor(UserPrincipal principal) {
        return principal.getRoles().contains(Role.AUDITOR);
    }

    public boolean hasAnyRole(UserPrincipal principal, Role... roles) {
        for (Role r : roles) {
            if (principal.getRoles().contains(r)) {
                return true;
            }
        }
        return false;
    }

    // ---------------------------------------------------------------------
    // Investigation-level access
    // ---------------------------------------------------------------------

    public boolean canViewCase(UserPrincipal principal, Investigation investigation) {
        if (isAdmin(principal)) {
            return true;
        }
        if (investigation.getCreatedBy() != null && investigation.getCreatedBy().equals(principal.getId())) {
            return true;
        }
        if (principal.getId().equals(investigation.getInvestigatingOfficer())) {
            return true;
        }
        // Case membership
        if (memberRepository.existsByInvestigationIdAndUserId(investigation.getId(), principal.getId())) {
            return true;
        }
        // Department membership (owning or participating department)
        String dept = principal.getDepartmentId();
        if (dept != null) {
            if (dept.equals(investigation.getOwnerDepartmentId())) {
                return true;
            }
            if (investigation.getParticipatingDepartmentIds() != null
                    && investigation.getParticipatingDepartmentIds().contains(dept)) {
                return true;
            }
        }
        return false;
    }

    public void requireCaseView(UserPrincipal principal, Investigation investigation) {
        if (!canViewCase(principal, investigation)) {
            audit(principal, AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT, investigation.getId(), null,
                    "Denied case view for " + investigation.getCaseNumber());
            throw new AccessDeniedApiException("Access denied to this investigation");
        }
    }

    public boolean canWriteCase(UserPrincipal principal, Investigation investigation) {
        if (isAdmin(principal)) {
            return true;
        }
        if (principal.getId().equals(investigation.getCreatedBy())
                || principal.getId().equals(investigation.getInvestigatingOfficer())) {
            return true;
        }
        return memberRepository.findByInvestigationIdAndUserId(investigation.getId(), principal.getId())
                .map(m -> m.getAccessLevel() == AccessLevel.READ_WRITE || m.getAccessLevel() == AccessLevel.CASE_OWNER)
                .orElse(false);
    }

    public void requireCaseWrite(UserPrincipal principal, Investigation investigation) {
        if (!canWriteCase(principal, investigation)) {
            audit(principal, AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT, investigation.getId(), null,
                    "Denied case write for " + investigation.getCaseNumber());
            throw new AccessDeniedApiException("Write access denied to this investigation");
        }
    }

    // ---------------------------------------------------------------------
    // Document-level access
    // ---------------------------------------------------------------------

    /**
     * Evaluate whether the principal may perform the given permission on a document.
     * Ownership and admin bypass grant checks; otherwise an active, unexpired grant
     * with the required permission (or case membership for non-restricted docs) is required.
     */
    public boolean hasDocumentPermission(UserPrincipal principal, DocumentEntity document, Permission permission) {
        if (isAdmin(principal)) {
            return true;
        }
        // Owner has full control over their own document.
        if (principal.getId().equals(document.getOwnerUserId())) {
            return true;
        }
        // Owning department members retain access to their department's documents.
        if (principal.getDepartmentId() != null
                && principal.getDepartmentId().equals(document.getOwnerDepartmentId())) {
            return true;
        }

        // PUBLIC_RECORD documents are viewable/downloadable by any case member.
        if (document.getClassification() == Classification.PUBLIC_RECORD
                && (permission == Permission.VIEW || permission == Permission.DOWNLOAD)
                && isCaseMember(principal, document.getInvestigationId())) {
            return true;
        }

        // Otherwise an explicit, active, in-window grant is required.
        return hasActiveGrant(principal, document, permission);
    }

    private boolean isCaseMember(UserPrincipal principal, String investigationId) {
        if (investigationId == null) {
            return false;
        }
        if (memberRepository.existsByInvestigationIdAndUserId(investigationId, principal.getId())) {
            return true;
        }
        Investigation inv = investigationRepository.findById(investigationId).orElse(null);
        return inv != null && canViewCase(principal, inv);
    }

    private boolean hasActiveGrant(UserPrincipal principal, DocumentEntity document, Permission permission) {
        List<DocumentAccessGrant> grants = grantRepository.findByDocumentIdAndStatus(document.getId(), GrantStatus.ACTIVE);
        Instant now = Instant.now();
        for (DocumentAccessGrant grant : grants) {
            if (!isGrantInWindow(grant, now)) {
                continue;
            }
            if (!grant.getPermissions().contains(permission)) {
                continue;
            }
            if (granteeMatches(principal, grant)) {
                return true;
            }
        }
        return false;
    }

    private boolean isGrantInWindow(DocumentAccessGrant grant, Instant now) {
        if (grant.getStartAt() != null && now.isBefore(grant.getStartAt())) {
            return false;
        }
        if (grant.getExpiresAt() != null && now.isAfter(grant.getExpiresAt())) {
            return false;
        }
        return true;
    }

    private boolean granteeMatches(UserPrincipal principal, DocumentAccessGrant grant) {
        return switch (grant.getGranteeType()) {
            case USER -> principal.getId().equals(grant.getGranteeId());
            case DEPARTMENT -> principal.getDepartmentId() != null
                    && principal.getDepartmentId().equals(grant.getGranteeId());
            case ROLE -> principal.getRoleNames().contains(grant.getGranteeId());
            case INVESTIGATION_PARTICIPANT -> isCaseMember(principal, grant.getGranteeId());
        };
    }

    public void requireDocumentPermission(UserPrincipal principal, DocumentEntity document, Permission permission) {
        if (!hasDocumentPermission(principal, document, permission)) {
            audit(principal, AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT, document.getInvestigationId(),
                    document.getId(), "Denied " + permission + " on document " + document.getId());
            // Repeated denied access is a security signal.
            securityAlertService.raise(AlertType.REPEATED_DENIED_ACCESS, AlertSeverity.MEDIUM,
                    principal.getUsername(),
                    "Denied " + permission + " attempt on document " + document.getId(),
                    document.getInvestigationId(), document.getId(), null);
            throw new AccessDeniedApiException("Access denied to this document");
        }
    }

    /**
     * Owner / admin / SHARE-permission holders may manage sharing on a document.
     */
    public boolean canShare(UserPrincipal principal, DocumentEntity document) {
        if (isAdmin(principal) || principal.getId().equals(document.getOwnerUserId())) {
            return true;
        }
        if (principal.getDepartmentId() != null
                && principal.getDepartmentId().equals(document.getOwnerDepartmentId())) {
            return true;
        }
        return hasActiveGrant(principal, document, Permission.SHARE);
    }

    public void requireShare(UserPrincipal principal, DocumentEntity document) {
        if (!canShare(principal, document)) {
            audit(principal, AuditAction.UNAUTHORIZED_ACCESS_ATTEMPT, document.getInvestigationId(),
                    document.getId(), "Denied share management on document " + document.getId());
            throw new AccessDeniedApiException("You are not permitted to manage sharing for this document");
        }
    }

    public boolean isDocumentOwnerOrAdmin(UserPrincipal principal, DocumentEntity document) {
        return isAdmin(principal) || principal.getId().equals(document.getOwnerUserId())
                || (principal.getDepartmentId() != null
                && principal.getDepartmentId().equals(document.getOwnerDepartmentId()));
    }

    public List<InvestigationMember> membersOf(String investigationId) {
        return memberRepository.findByInvestigationId(investigationId);
    }

    private void audit(UserPrincipal principal, AuditAction action, String investigationId,
                       String documentId, String description) {
        auditService.record(principal.getUsername(), firstRole(principal), action,
                investigationId, documentId, null, "DENIED", description, null, null);
    }

    private String firstRole(UserPrincipal principal) {
        return principal.getRoleNames().isEmpty() ? null : principal.getRoleNames().get(0);
    }
}
