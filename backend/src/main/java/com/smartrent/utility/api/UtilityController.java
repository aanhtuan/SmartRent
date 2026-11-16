package com.smartrent.utility.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.utility.application.UtilityService;
import com.smartrent.utility.domain.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
public class UtilityController {
  private final UtilityService service;

  public UtilityController(UtilityService service) {
    this.service = service;
  }

  public record TariffBody(
      BigDecimal electricityRate,
      BigDecimal waterRate,
      BigDecimal internetFee,
      BigDecimal garbageFee,
      BigDecimal otherFees) {}

  public record TariffView(
      UUID id,
      UUID propertyId,
      BigDecimal electricityRate,
      BigDecimal waterRate,
      BigDecimal internetFee,
      BigDecimal garbageFee,
      BigDecimal otherFees,
      Instant updatedAt) {}

  public record MeterReadingCreateBody(
      UUID roomId,
      UUID contractId,
      LocalDate billingPeriod,
      LocalDate recordedDate,
      BigDecimal oldElectricityKwh,
      BigDecimal newElectricityKwh,
      BigDecimal oldWaterM3,
      BigDecimal newWaterM3) {}

  public record MeterReadingView(
      UUID id,
      UUID propertyId,
      UUID roomId,
      UUID contractId,
      LocalDate billingPeriod,
      LocalDate recordedDate,
      BigDecimal oldElectricityKwh,
      BigDecimal newElectricityKwh,
      BigDecimal oldWaterM3,
      BigDecimal newWaterM3,
      BigDecimal electricityAmount,
      BigDecimal waterAmount,
      BigDecimal servicesAmount,
      BigDecimal totalUtilityAmount,
      Instant createdAt) {}

  private TariffView tariffView(ServiceTariff t) {
    return new TariffView(
        t.id,
        t.propertyId,
        t.electricityRate,
        t.waterRate,
        t.internetFee,
        t.garbageFee,
        t.otherFees,
        t.updatedAt);
  }

  private MeterReadingView readingView(MeterReading r) {
    if (r == null) return null;
    return new MeterReadingView(
        r.id,
        r.propertyId,
        r.roomId,
        r.contractId,
        r.billingPeriod,
        r.recordedDate,
        r.oldElectricityKwh,
        r.newElectricityKwh,
        r.oldWaterM3,
        r.newWaterM3,
        r.electricityAmount,
        r.waterAmount,
        r.servicesAmount,
        r.totalUtilityAmount,
        r.createdAt);
  }

  @GetMapping("/api/properties/{propertyId}/tariffs")
  TariffView getTariff(@PathVariable UUID propertyId) {
    return tariffView(service.getTariff(propertyId, Actor.current()));
  }

  @PutMapping("/api/properties/{propertyId}/tariffs")
  TariffView updateTariff(@PathVariable UUID propertyId, @RequestBody TariffBody b) {
    return tariffView(
        service.updateTariff(
            propertyId,
            b.electricityRate(),
            b.waterRate(),
            b.internetFee(),
            b.garbageFee(),
            b.otherFees(),
            Actor.current()));
  }

  @GetMapping("/api/rooms/{roomId}/latest-meter-reading")
  MeterReadingView getLatestReading(@PathVariable UUID roomId) {
    return readingView(service.getLatestReading(roomId, Actor.current()));
  }

  @PostMapping("/api/meter-readings")
  @ResponseStatus(HttpStatus.CREATED)
  MeterReadingView recordReading(@RequestBody MeterReadingCreateBody b) {
    return readingView(
        service.recordReading(
            b.roomId(),
            b.contractId(),
            b.billingPeriod(),
            b.recordedDate(),
            b.oldElectricityKwh(),
            b.newElectricityKwh(),
            b.oldWaterM3(),
            b.newWaterM3(),
            Actor.current()));
  }

  @GetMapping("/api/contracts/{contractId}/meter-readings")
  List<MeterReadingView> getContractReadings(@PathVariable UUID contractId) {
    return service.getReadingsByContract(contractId, Actor.current()).stream()
        .map(this::readingView)
        .toList();
  }
}
