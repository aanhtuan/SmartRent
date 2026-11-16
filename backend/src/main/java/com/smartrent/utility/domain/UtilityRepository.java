package com.smartrent.utility.domain;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface UtilityRepository {
  ServiceTariff findTariffByProperty(UUID propertyId);

  ServiceTariff saveTariff(ServiceTariff tariff);

  MeterReading findReading(UUID id);

  MeterReading findReadingByContractAndPeriod(UUID contractId, LocalDate billingPeriod);

  List<MeterReading> findReadingsByContract(UUID contractId);

  MeterReading findLatestReadingByRoom(UUID roomId);

  MeterReading saveReading(MeterReading reading);
}
