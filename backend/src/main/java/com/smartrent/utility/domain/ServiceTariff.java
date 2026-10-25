package com.smartrent.utility.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class ServiceTariff {
  public UUID id;
  public UUID propertyId;
  public BigDecimal electricityRate;
  public BigDecimal waterRate;
  public BigDecimal internetFee;
  public BigDecimal garbageFee;
  public BigDecimal otherFees;
  public Instant createdAt;
  public Instant updatedAt;
}
