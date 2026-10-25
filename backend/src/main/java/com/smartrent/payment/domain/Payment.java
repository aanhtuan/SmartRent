package com.smartrent.payment.domain;

import java.math.BigDecimal;
import java.time.*;
import java.util.UUID;

/** Internal domain data, never a JPA entity or an HTTP request. */
public class Payment {
  public UUID id;
  public UUID contractId;
  public LocalDate billingPeriod;
  public LocalDate dueDate;
  public BigDecimal amount;
  public String status;
  public Instant createdAt;
  public Instant updatedAt;
}
