package com.smartrent.property.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "properties")
class PropertyRecord extends StoredRecord {
  @Column(name = "owner_user_id")
  public UUID ownerUserId;

  @Column(name = "name")
  public String name;

  @Column(name = "address")
  public String address;

  @Column(name = "status", columnDefinition = "text")
  public String status;
}
