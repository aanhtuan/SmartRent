package com.smartrent.contract.domain;

import java.time.*;
import java.util.UUID;

/** Internal domain data, never a JPA entity or an HTTP request. */
public class Contract {
  public UUID id;
  public UUID tenantProfileId;
  public UUID roomId;
  public LocalDate startDate;
  public LocalDate endDate;
  public String status;
  public Instant createdAt;
  public Instant updatedAt;
}
