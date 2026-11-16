package com.smartrent.maintenance.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "maintenance_requests")
class MaintenanceRecord extends StoredRecord {
  @Column(name = "tenant_profile_id")
  public UUID tenantProfileId;

  @Column(name = "room_id")
  public UUID roomId;

  @Column(name = "original_description")
  public String originalDescription;

  @Column(name = "submission_key")
  public UUID submissionKey;

  @Column(name = "submission_digest")
  public String submissionDigest;

  @Column(name = "category")
  public String category;

  @Column(name = "priority")
  public String priority;

  @Column(name = "ai_summary")
  public String aiSummary;

  @Column(name = "ai_confidence", precision = 4, scale = 3)
  public BigDecimal aiConfidence;

  @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.ARRAY)
  @Column(name = "ai_missing_information", columnDefinition = "text[]")
  public String[] aiMissingInformation;

  @Column(name = "ai_classification_status")
  public String aiClassificationStatus;

  @Column(name = "status", columnDefinition = "text")
  public String status;

  @Column(name = "updated_by_user_id")
  public UUID updatedByUserId;

  @Column(name = "cancellation_reason")
  public String cancellationReason;
}
