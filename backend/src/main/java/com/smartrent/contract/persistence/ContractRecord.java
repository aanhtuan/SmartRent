package com.smartrent.contract.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "contracts")
class ContractRecord extends StoredRecord {
  @Column(name = "tenant_profile_id")
  public UUID tenantProfileId;

  @Column(name = "room_id")
  public UUID roomId;

  @Column(name = "start_date")
  public LocalDate startDate;

  @Column(name = "end_date")
  public LocalDate endDate;

  @Column(name = "status", columnDefinition = "text")
  public String status;

  @Column(name = "tenant_signature", columnDefinition = "text")
  public String tenantSignature;

  @Column(name = "tenant_signed_at")
  public Instant tenantSignedAt;

  @Column(name = "landlord_signature", columnDefinition = "text")
  public String landlordSignature;

  @Column(name = "landlord_signed_at")
  public Instant landlordSignedAt;
}
