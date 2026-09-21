package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.common.dto.PageResponse;
import com.investigation.dms.dto.document.DocumentResponse;
import com.investigation.dms.dto.search.DocumentSearchRequest;
import com.investigation.dms.dto.search.GlobalSearchResult;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Search")
@RestController
@RequestMapping("/api")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @Operation(summary = "Advanced document search")
    @GetMapping("/search/documents")
    public ResponseEntity<ApiResponse<PageResponse<DocumentResponse>>> searchDocuments(
            DocumentSearchRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                searchService.searchDocuments(request, SecurityUtils.currentPrincipal())));
    }

    @Operation(summary = "Global search across permitted resources")
    @GetMapping("/global-search")
    public ResponseEntity<ApiResponse<GlobalSearchResult>> globalSearch(@RequestParam("q") String query) {
        return ResponseEntity.ok(ApiResponse.ok(
                searchService.globalSearch(query, SecurityUtils.currentPrincipal())));
    }
}
