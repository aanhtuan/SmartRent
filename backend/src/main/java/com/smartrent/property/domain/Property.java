package com.smartrent.property.domain;

import java.time.*;
import java.util.UUID;

/** Internal domain data, never a JPA entity or an HTTP request. */
public class Property {
  public UUID id;
  public UUID ownerUserId;
  public String name;
  public String address;
  public String status;
  public Instant createdAt;
  public Instant updatedAt;
}
