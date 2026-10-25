package com.smartrent.utility.application;

import com.smartrent.contract.application.ContractAccess;
import com.smartrent.identity.application.Actor;
import com.smartrent.property.application.PropertyAccess;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.utility.domain.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class UtilityService {
  private final UtilityRepository repo;
  private final PropertyAccess properties;
  private final RoomAccess rooms;
  private final ContractAccess contracts;

  public UtilityService(
      UtilityRepository repo,
      PropertyAccess properties,
      RoomAccess rooms,
      ContractAccess contracts) {
    this.repo = repo;
    this.properties = properties;
    this.rooms = rooms;
    this.contracts = contracts;
  }

  @Transactional(readOnly = true)
  public ServiceTariff getTariff(UUID propertyId, Actor actor) {
    if (actor.landlord()) {
      properties.owned(propertyId, actor);
    }
    var t = repo.findTariffByProperty(propertyId);
    if (t == null) {
      t = new ServiceTariff();
      t.propertyId = propertyId;
      t.electricityRate = BigDecimal.ZERO;
      t.waterRate = BigDecimal.ZERO;
      t.internetFee = BigDecimal.ZERO;
      t.garbageFee = BigDecimal.ZERO;
      t.otherFees = BigDecimal.ZERO;
    }
    return t;
  }

  @Transactional
  public ServiceTariff updateTariff(
      UUID propertyId,
      BigDecimal elecRate,
      BigDecimal waterRate,
      BigDecimal internetFee,
      BigDecimal garbageFee,
      BigDecimal otherFees,
      Actor actor) {
    properties.owned(propertyId, actor);

    if (elecRate == null || elecRate.compareTo(BigDecimal.ZERO) < 0
        || waterRate == null || waterRate.compareTo(BigDecimal.ZERO) < 0
        || internetFee == null || internetFee.compareTo(BigDecimal.ZERO) < 0
        || garbageFee == null || garbageFee.compareTo(BigDecimal.ZERO) < 0
        || otherFees == null || otherFees.compareTo(BigDecimal.ZERO) < 0) {
      throw ApiFailure.invalid();
    }

    var t = repo.findTariffByProperty(propertyId);
    if (t == null) {
      t = new ServiceTariff();
      t.propertyId = propertyId;
    }
    t.electricityRate = elecRate;
    t.waterRate = waterRate;
    t.internetFee = internetFee;
    t.garbageFee = garbageFee;
    t.otherFees = otherFees;
    return repo.saveTariff(t);
  }

  @Transactional(readOnly = true)
  public MeterReading getLatestReading(UUID roomId, Actor actor) {
    rooms.visible(roomId, actor);
    return repo.findLatestReadingByRoom(roomId);
  }

  @Transactional(readOnly = true)
  public List<MeterReading> getReadingsByContract(UUID contractId, Actor actor) {
    contracts.visible(contractId, actor);
    return repo.findReadingsByContract(contractId);
  }

  @Transactional
  public MeterReading recordReading(
      UUID roomId,
      UUID contractId,
      LocalDate billingPeriod,
      LocalDate recordedDate,
      BigDecimal oldElec,
      BigDecimal newElec,
      BigDecimal oldWater,
      BigDecimal newWater,
      Actor actor) {
    var room = rooms.owned(roomId, actor);
    var contract = contracts.visible(contractId, actor);

    if (!contract.roomId.equals(roomId)) {
      throw ApiFailure.invalid();
    }
    if (billingPeriod == null || billingPeriod.getDayOfMonth() != 1) {
      throw ApiFailure.invalid();
    }
    if (recordedDate == null) {
      throw ApiFailure.invalid();
    }
    if (oldElec == null || oldElec.compareTo(BigDecimal.ZERO) < 0
        || newElec == null || newElec.compareTo(oldElec) < 0) {
      throw ApiFailure.invalid();
    }
    if (oldWater == null || oldWater.compareTo(BigDecimal.ZERO) < 0
        || newWater == null || newWater.compareTo(oldWater) < 0) {
      throw ApiFailure.invalid();
    }

    var tariff = getTariff(room.propertyId, actor);
    var elecDelta = newElec.subtract(oldElec);
    var waterDelta = newWater.subtract(oldWater);

    var elecAmount = elecDelta.multiply(tariff.electricityRate).setScale(0, RoundingMode.HALF_UP);
    var waterAmount = waterDelta.multiply(tariff.waterRate).setScale(0, RoundingMode.HALF_UP);
    var servicesAmount =
        tariff.internetFee.add(tariff.garbageFee).add(tariff.otherFees).setScale(0, RoundingMode.HALF_UP);
    var total = elecAmount.add(waterAmount).add(servicesAmount);

    var reading = repo.findReadingByContractAndPeriod(contractId, billingPeriod);
    if (reading == null) {
      reading = new MeterReading();
      reading.propertyId = room.propertyId;
      reading.roomId = roomId;
      reading.contractId = contractId;
      reading.billingPeriod = billingPeriod;
    }
    reading.recordedDate = recordedDate;
    reading.oldElectricityKwh = oldElec;
    reading.newElectricityKwh = newElec;
    reading.oldWaterM3 = oldWater;
    reading.newWaterM3 = newWater;
    reading.electricityAmount = elecAmount;
    reading.waterAmount = waterAmount;
    reading.servicesAmount = servicesAmount;
    reading.totalUtilityAmount = total;

    return repo.saveReading(reading);
  }
}
