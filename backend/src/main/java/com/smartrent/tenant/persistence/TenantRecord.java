package com.smartrent.tenant.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "tenant_profiles")
class TenantRecord extends StoredRecord {
  @Column(name = "user_id")
  public UUID userId;

  @Column(name = "manager_landlord_id")
  public UUID managerLandlordId;

  @Column(name = "full_name")
  public String fullName;

  @Column(name = "phone_number")
  public String phoneNumber;
}
