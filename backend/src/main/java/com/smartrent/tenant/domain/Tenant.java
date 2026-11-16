package com.smartrent.tenant.domain;

import java.time.*;
import java.util.UUID;

/** Internal domain data, never a JPA entity or an HTTP request. */
public class Tenant {
  public UUID id;
  public UUID userId;
  public UUID managerLandlordId;
  public String fullName;
  public String phoneNumber;
  public Instant createdAt;
  public Instant updatedAt;
}
