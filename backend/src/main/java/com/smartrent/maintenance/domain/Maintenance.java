package com.smartrent.maintenance.domain;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

/** Internal domain data, never a JPA entity or an HTTP request. */
public class Maintenance {
  public UUID id;
  public UUID tenantProfileId;
  public UUID roomId;
  public String originalDescription;
  public UUID submissionKey;
  public String submissionDigest;
  public String category;
  public String priority;
  public String aiSummary;
  public BigDecimal aiConfidence;
  public String[] aiMissingInformation;
  public String aiClassificationStatus;
  public String status;
  public UUID updatedByUserId;
  public String cancellationReason;
  public Instant createdAt;
  public Instant updatedAt;
}
