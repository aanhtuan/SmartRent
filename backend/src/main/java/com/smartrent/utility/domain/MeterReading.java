package com.smartrent.utility.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class MeterReading {
  public UUID id;
  public UUID propertyId;
  public UUID roomId;
  public UUID contractId;
  public LocalDate billingPeriod;
  public LocalDate recordedDate;
  public BigDecimal oldElectricityKwh;
  public BigDecimal newElectricityKwh;
  public BigDecimal oldWaterM3;
  public BigDecimal newWaterM3;
  public BigDecimal electricityAmount;
  public BigDecimal waterAmount;
  public BigDecimal servicesAmount;
  public BigDecimal totalUtilityAmount;
  public Instant createdAt;
  public Instant updatedAt;
}
