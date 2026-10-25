package com.smartrent.inventory.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "deposits")
class DepositRecord extends StoredRecord {
  @Column(name = "contract_id", nullable = false, unique = true)
  public UUID contractId;

  @Column(name = "amount", nullable = false)
  public long amount;

  @Column(name = "status", nullable = false)
  public String status;

  @Column(name = "refund_amount", nullable = false)
  public long refundAmount;

  @Column(name = "deduction_amount", nullable = false)
  public long deductionAmount;

  @Column(name = "deduction_reason")
  public String deductionReason;

  @Column(name = "held_at", nullable = false)
  public Instant heldAt;

  @Column(name = "resolved_at")
  public Instant resolvedAt;
}
