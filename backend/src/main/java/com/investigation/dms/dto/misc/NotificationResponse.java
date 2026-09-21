package com.investigation.dms.dto.misc;

import com.investigation.dms.common.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private String id;
    private String title;
    private String message;
    private NotificationType type;
    private boolean read;
    private String actionUrl;
    private Instant createdAt;
}
