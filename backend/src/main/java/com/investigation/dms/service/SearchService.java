package com.investigation.dms.service;

import com.investigation.dms.common.dto.PageResponse;
import com.investigation.dms.common.enums.Permission;
import com.investigation.dms.dto.document.DocumentResponse;
import com.investigation.dms.dto.search.DocumentSearchRequest;
import com.investigation.dms.dto.search.GlobalSearchResult;
import com.investigation.dms.model.DocumentEntity;
import com.investigation.dms.model.Evidence;
import com.investigation.dms.model.Investigation;
import com.investigation.dms.model.User;
import com.investigation.dms.repository.DocumentRepository;
import com.investigation.dms.repository.EvidenceRepository;
import com.investigation.dms.repository.InvestigationRepository;
import com.investigation.dms.repository.UserRepository;
import com.investigation.dms.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Authorization-aware advanced and global search (FR-SEARCH-001/002, section 20.2).
 * Results are always filtered so the backend never returns records the caller
 * cannot access. OCR-extracted text is only matched for documents the user may view.
 */
@Service
public class SearchService {

    private final DocumentRepository documentRepository;
    private final InvestigationRepository investigationRepository;
    private final EvidenceRepository evidenceRepository;
    private final UserRepository userRepository;
    private final AccessControlService accessControl;
    private final DocumentService documentService;

    public SearchService(DocumentRepository documentRepository,
                         InvestigationRepository investigationRepository,
                         EvidenceRepository evidenceRepository,
                         UserRepository userRepository,
                         AccessControlService accessControl,
                         DocumentService documentService) {
        this.documentRepository = documentRepository;
        this.investigationRepository = investigationRepository;
        this.evidenceRepository = evidenceRepository;
        this.userRepository = userRepository;
        this.accessControl = accessControl;
        this.documentService = documentService;
    }

    public PageResponse<DocumentResponse> searchDocuments(DocumentSearchRequest req, UserPrincipal principal) {
        String caseId = null;
        if (StringUtils.hasText(req.getCaseNumber())) {
            caseId = investigationRepository.findByCaseNumber(req.getCaseNumber())
                    .map(Investigation::getId).orElse("__none__");
        }
        final String caseIdFinal = caseId;

        List<DocumentResponse> filtered = documentRepository.findAll().stream()
                .filter(d -> accessControl.hasDocumentPermission(principal, d, Permission.VIEW))
                .filter(d -> caseIdFinal == null || caseIdFinal.equals(d.getInvestigationId()))
                .filter(d -> req.getType() == null || req.getType() == d.getType())
                .filter(d -> req.getClassification() == null || req.getClassification() == d.getClassification())
                .filter(d -> req.getWorkflowStatus() == null || req.getWorkflowStatus() == d.getWorkflowStatus())
                .filter(d -> req.getIntegrityStatus() == null || req.getIntegrityStatus() == d.getIntegrityStatus())
                .filter(d -> req.getSignatureStatus() == null || req.getSignatureStatus() == d.getSignatureStatus())
                .filter(d -> req.getDepartmentId() == null || req.getDepartmentId().equals(d.getOwnerDepartmentId()))
                .filter(d -> matchesKeyword(d, req.getKeyword()))
                .filter(d -> req.getFromDate() == null
                        || (d.getCreatedAt() != null && !d.getCreatedAt().isBefore(req.getFromDate())))
                .filter(d -> req.getToDate() == null
                        || (d.getCreatedAt() != null && !d.getCreatedAt().isAfter(req.getToDate())))
                .map(documentService::toResponse)
                .toList();

        int from = Math.min(req.getPage() * req.getSize(), filtered.size());
        int to = Math.min(from + req.getSize(), filtered.size());
        return PageResponse.of(filtered.subList(from, to), req.getPage(), req.getSize(), filtered.size());
    }

    private boolean matchesKeyword(DocumentEntity d, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        String k = keyword.toLowerCase();
        return contains(d.getDocumentName(), k)
                || contains(d.getOriginalFilename(), k)
                || contains(d.getExtractedText(), k)
                || (d.getType() != null && d.getType().name().toLowerCase().contains(k));
    }

    private boolean contains(String haystack, String needle) {
        return haystack != null && haystack.toLowerCase().contains(needle);
    }

    private boolean canViewEvidenceCase(UserPrincipal principal, Evidence e) {
        return investigationRepository.findById(e.getInvestigationId())
                .map(inv -> accessControl.canViewCase(principal, inv))
                .orElse(false);
    }

    public GlobalSearchResult globalSearch(String query, UserPrincipal principal) {
        String q = query == null ? "" : query.toLowerCase();

        List<GlobalSearchResult.SearchHit> cases = investigationRepository.findAll().stream()
                .filter(inv -> accessControl.canViewCase(principal, inv))
                .filter(inv -> contains(inv.getCaseNumber(), q) || contains(inv.getTitle(), q)
                        || contains(inv.getCrimeType(), q) || contains(inv.getLocation(), q))
                .map(inv -> GlobalSearchResult.SearchHit.builder()
                        .id(inv.getId()).type("CASE").title(inv.getCaseNumber())
                        .subtitle(inv.getTitle()).build())
                .limit(20).toList();

        List<GlobalSearchResult.SearchHit> docs = documentRepository.findAll().stream()
                .filter(d -> accessControl.hasDocumentPermission(principal, d, Permission.VIEW))
                .filter(d -> matchesKeyword(d, q))
                .map(d -> GlobalSearchResult.SearchHit.builder()
                        .id(d.getId()).type("DOCUMENT").title(d.getDocumentName())
                        .subtitle(d.getType() == null ? null : d.getType().name()).build())
                .limit(20).toList();

        List<GlobalSearchResult.SearchHit> evidence = evidenceRepository.findAll().stream()
                .filter(e -> canViewEvidenceCase(principal, e))
                .filter(e -> contains(e.getEvidenceId(), q) || contains(e.getType(), q)
                        || contains(e.getDescription(), q))
                .map(e -> GlobalSearchResult.SearchHit.builder()
                        .id(e.getId()).type("EVIDENCE").title(e.getEvidenceId())
                        .subtitle(e.getType()).build())
                .limit(20).toList();

        // People search available to admins/auditors only.
        List<GlobalSearchResult.SearchHit> people = List.of();
        if (accessControl.isAdmin(principal) || accessControl.isAuditor(principal)) {
            people = userRepository.findAll().stream()
                    .filter(u -> contains(u.getFullName(), q) || contains(u.getUsername(), q)
                            || contains(u.getBadgeNumber(), q))
                    .map(u -> GlobalSearchResult.SearchHit.builder()
                            .id(u.getId()).type("PERSON").title(u.getFullName())
                            .subtitle(u.getUsername()).build())
                    .limit(20).toList();
        }

        return GlobalSearchResult.builder()
                .cases(cases).documents(docs).evidence(evidence).people(people).build();
    }
}
