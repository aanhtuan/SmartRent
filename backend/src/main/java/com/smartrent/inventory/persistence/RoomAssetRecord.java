package com.smartrent.inventory.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "room_assets")
class RoomAssetRecord extends StoredRecord {
  @Column(name = "room_id", nullable = false)
  public UUID roomId;

  @Column(name = "name", nullable = false)
  public String name;

  @Column(name = "asset_code")
  public String assetCode;

  @Column(name = "condition_status", nullable = false)
  public String conditionStatus;

  @Column(name = "initial_notes")
  public String initialNotes;

  @Column(name = "handover_notes")
  public String handoverNotes;
}
