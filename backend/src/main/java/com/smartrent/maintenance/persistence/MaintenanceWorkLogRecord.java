package com.smartrent.maintenance.persistence;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "maintenance_work_logs")
class MaintenanceWorkLogRecord {
  @Id public UUID id;

  @Column(name = "maintenance_request_id", nullable = false)
  public UUID maintenanceRequestId;

  @Column(name = "recorded_by_user_id", nullable = false)
  public UUID recordedByUserId;

  @Column(name = "performed_by", nullable = false, length = 200)
  public String performedBy;

  @Column(name = "work_description", nullable = false, length = 2000)
  public String workDescription;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt;

  @PrePersist
  void created() {
    if (id == null) id = UUID.randomUUID();
    if (createdAt == null) createdAt = Instant.now();
  }
}
