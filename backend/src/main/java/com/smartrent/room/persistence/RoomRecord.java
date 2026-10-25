package com.smartrent.room.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "rooms")
class RoomRecord extends StoredRecord {
  @Column(name = "property_id")
  public UUID propertyId;

  @Column(name = "room_code")
  public String roomCode;

  @Column(name = "status", columnDefinition = "text")
  public String status;
}
