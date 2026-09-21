package com.investigation.dms.controller;

import com.investigation.dms.common.dto.ApiResponse;
import com.investigation.dms.dto.misc.DashboardStats;
import com.investigation.dms.security.SecurityUtils;
import com.investigation.dms.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard")
@RestController
@RequestMapping("/api/stats")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @Operation(summary = "Dashboard statistics scoped to the caller")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStats>> dashboard() {
        return ResponseEntity.ok(ApiResponse.ok(
                dashboardService.stats(SecurityUtils.currentPrincipal())));
    }
}
