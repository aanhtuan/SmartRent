package com.smartrent.inventory.domain;

import java.time.Instant;
import java.util.UUID;

public class Deposit {
  public UUID id;
  public UUID contractId;
  public long amount;
  public String status;
  public long refundAmount;
  public long deductionAmount;
  public String deductionReason;
  public Instant heldAt;
  public Instant resolvedAt;
  public Instant createdAt;
  public Instant updatedAt;

  public Deposit() {}

  public Deposit(
      UUID id,
      UUID contractId,
      long amount,
      String status,
      long refundAmount,
      long deductionAmount,
      String deductionReason,
      Instant heldAt,
      Instant resolvedAt,
      Instant createdAt,
      Instant updatedAt) {
    this.id = id;
    this.contractId = contractId;
    this.amount = amount;
    this.status = status;
    this.refundAmount = refundAmount;
    this.deductionAmount = deductionAmount;
    this.deductionReason = deductionReason;
    this.heldAt = heldAt;
    this.resolvedAt = resolvedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
