package com.smartrent.payment.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "payments")
class PaymentRecord extends StoredRecord {
  @Column(name = "contract_id")
  public UUID contractId;

  @Column(name = "billing_period")
  public LocalDate billingPeriod;

  @Column(name = "due_date")
  public LocalDate dueDate;

  @Column(name = "amount", precision = 12, scale = 2)
  public BigDecimal amount;

  @Column(name = "status", columnDefinition = "text")
  public String status;
}
