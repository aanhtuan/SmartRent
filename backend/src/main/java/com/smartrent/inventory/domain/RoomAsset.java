package com.smartrent.inventory.domain;

import java.time.Instant;
import java.util.UUID;

public class RoomAsset {
  public UUID id;
  public UUID roomId;
  public String name;
  public String assetCode;
  public String conditionStatus;
  public String initialNotes;
  public String handoverNotes;
  public Instant createdAt;
  public Instant updatedAt;

  public RoomAsset() {}

  public RoomAsset(
      UUID id,
      UUID roomId,
      String name,
      String assetCode,
      String conditionStatus,
      String initialNotes,
      String handoverNotes,
      Instant createdAt,
      Instant updatedAt) {
    this.id = id;
    this.roomId = roomId;
    this.name = name;
    this.assetCode = assetCode;
    this.conditionStatus = conditionStatus;
    this.initialNotes = initialNotes;
    this.handoverNotes = handoverNotes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
