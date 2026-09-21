package com.investigation.dms.service;

import com.investigation.dms.common.enums.NotificationType;
import com.investigation.dms.dto.misc.NotificationResponse;
import com.investigation.dms.model.Notification;
import com.investigation.dms.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification notify(String userId, String title, String message, NotificationType type, String actionUrl) {
        Notification n = Notification.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .actionUrl(actionUrl)
                .read(false)
                .build();
        return notificationRepository.save(n);
    }

    public List<NotificationResponse> forUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public long unreadCount(String userId) {
        return notificationRepository.countByUserIdAndRead(userId, false);
    }

    public void markRead(String id, String userId) {
        notificationRepository.findById(id)
                .filter(n -> n.getUserId().equals(userId))
                .ifPresent(n -> {
                    n.setRead(true);
                    notificationRepository.save(n);
                });
    }

    public void markAllRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndRead(userId, false);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    public NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
