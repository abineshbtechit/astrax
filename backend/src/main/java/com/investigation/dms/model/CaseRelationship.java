package com.investigation.dms.model;

import com.investigation.dms.common.enums.NodeType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "case_relationships")
public class CaseRelationship {

    @Id
    private String id;

    @Indexed
    private String investigationId;

    private Node sourceNode;

    private Node targetNode;

    private String relationshipType;

    @Builder.Default
    private Map<String, Object> properties = new HashMap<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Node {
        private NodeType nodeType;
        private String refId;
        private String label;
    }
}
