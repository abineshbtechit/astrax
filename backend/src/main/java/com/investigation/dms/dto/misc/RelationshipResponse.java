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
public class RelationshipResponse {
    private List<GraphNode> nodes;
    private List<GraphEdge> edges;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphNode {
        private String id;
        private String nodeType;
        private String label;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GraphEdge {
        private String id;
        private String source;
        private String target;
        private String relationshipType;
        private Map<String, Object> properties;
    }
}
