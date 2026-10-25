package com.smartrent.notification.domain;

import java.time.Instant;
import java.util.UUID;

public record Notification(
    UUID id,
    UUID recipientUserId,
    String type,
    String message,
    Instant readAt,
    Instant createdAt,
    String sourceType,
    UUID sourceId) {}
