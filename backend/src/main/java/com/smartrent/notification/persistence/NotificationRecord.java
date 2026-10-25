package com.smartrent.notification.persistence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notifications")
class NotificationRecord {
  @Id UUID id;

  @Column(name = "recipient_user_id")
  UUID recipientUserId;

  String type;
  String message;

  @Column(name = "maintenance_request_id")
  UUID maintenanceRequestId;

  @Column(name = "payment_id")
  UUID paymentId;

  @Column(name = "contract_id")
  UUID contractId;

  @Column(name = "read_at")
  Instant readAt;

  @Column(name = "created_at")
  Instant createdAt;
}
