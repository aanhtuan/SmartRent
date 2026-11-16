package com.smartrent.utility.persistence;

import com.smartrent.shared.persistence.StoredRecord;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "service_tariffs")
class ServiceTariffRecord extends StoredRecord {
  @Column(name = "property_id", nullable = false)
  public UUID propertyId;

  @Column(name = "electricity_rate", nullable = false)
  public BigDecimal electricityRate;

  @Column(name = "water_rate", nullable = false)
  public BigDecimal waterRate;

  @Column(name = "internet_fee", nullable = false)
  public BigDecimal internetFee;

  @Column(name = "garbage_fee", nullable = false)
  public BigDecimal garbageFee;

  @Column(name = "other_fees", nullable = false)
  public BigDecimal otherFees;
}
