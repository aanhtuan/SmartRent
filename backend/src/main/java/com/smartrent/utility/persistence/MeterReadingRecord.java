package com.smartrent.utility.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meter_readings")
class MeterReadingRecord extends StoredRecord {
  @Column(name = "property_id", nullable = false)
  public UUID propertyId;

  @Column(name = "room_id", nullable = false)
  public UUID roomId;

  @Column(name = "contract_id", nullable = false)
  public UUID contractId;

  @Column(name = "billing_period", nullable = false)
  public LocalDate billingPeriod;

  @Column(name = "recorded_date", nullable = false)
  public LocalDate recordedDate;

  @Column(name = "old_electricity_kwh", nullable = false)
  public BigDecimal oldElectricityKwh;

  @Column(name = "new_electricity_kwh", nullable = false)
  public BigDecimal newElectricityKwh;

  @Column(name = "old_water_m3", nullable = false)
  public BigDecimal oldWaterM3;

  @Column(name = "new_water_m3", nullable = false)
  public BigDecimal newWaterM3;

  @Column(name = "electricity_amount", nullable = false)
  public BigDecimal electricityAmount;

  @Column(name = "water_amount", nullable = false)
  public BigDecimal waterAmount;

  @Column(name = "services_amount", nullable = false)
  public BigDecimal servicesAmount;

  @Column(name = "total_utility_amount", nullable = false)
  public BigDecimal totalUtilityAmount;
}
