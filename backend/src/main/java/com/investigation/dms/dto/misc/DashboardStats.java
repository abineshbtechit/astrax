package com.investigation.dms.dto.misc;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {
    private long totalCases;
    private long activeInvestigations;
    private long pendingReviews;
    private long totalDocuments;
    private long totalEvidence;
    private long openSecurityAlerts;
    private long unreadNotifications;
    private Map<String, Long> casesByStatus;
    private Map<String, Long> documentsByType;
    private List<RecentActivity> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivity {
        private String action;
        private String actor;
        private String description;
        private String timestamp;
    }
}
