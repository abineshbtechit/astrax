package com.investigation.dms.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GlobalSearchResult {
    private List<SearchHit> cases;
    private List<SearchHit> documents;
    private List<SearchHit> evidence;
    private List<SearchHit> people;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchHit {
        private String id;
        private String type;
        private String title;
        private String subtitle;
    }
}
