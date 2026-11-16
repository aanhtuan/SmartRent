package com.smartrent.room.domain;

import java.time.*;
import java.util.UUID;

/** Internal domain data, never a JPA entity or an HTTP request. */
public class Room {
  public UUID id;
  public UUID propertyId;
  public String roomCode;
  public String status;
  public Instant createdAt;
  public Instant updatedAt;
}
