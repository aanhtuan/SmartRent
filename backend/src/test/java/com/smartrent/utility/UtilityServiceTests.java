package com.smartrent.utility;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.smartrent.contract.application.ContractAccess;
import com.smartrent.contract.domain.Contract;
import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.property.application.PropertyAccess;
import com.smartrent.property.domain.Property;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.room.domain.Room;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.utility.application.UtilityService;
import com.smartrent.utility.domain.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UtilityServiceTests {
  private UtilityRepository repo;
  private PropertyAccess properties;
  private RoomAccess rooms;
  private ContractAccess contracts;
  private UtilityService service;

  private final UUID landlordId = UUID.randomUUID();
  private final Actor landlord = new Actor(landlordId, AccountRole.LANDLORD);
  private final Actor tenant = new Actor(UUID.randomUUID(), AccountRole.TENANT);
  private final UUID propertyId = UUID.randomUUID();
  private final UUID roomId = UUID.randomUUID();
  private final UUID contractId = UUID.randomUUID();

  @BeforeEach
  void setUp() {
    repo = mock(UtilityRepository.class);
    properties = mock(PropertyAccess.class);
    rooms = mock(RoomAccess.class);
    contracts = mock(ContractAccess.class);
    service = new UtilityService(repo, properties, rooms, contracts);

    var prop = new Property();
    prop.id = propertyId;
    prop.ownerUserId = landlordId;
    when(properties.owned(eq(propertyId), eq(landlord))).thenReturn(prop);

    var room = new Room();
    room.id = roomId;
    room.propertyId = propertyId;
    when(rooms.owned(eq(roomId), eq(landlord))).thenReturn(room);

    var contract = new Contract();
    contract.id = contractId;
    contract.roomId = roomId;
    when(contracts.visible(eq(contractId), eq(landlord))).thenReturn(contract);
  }

  @Test
  void updateTariff_savesValidTariff() {
    when(repo.saveTariff(any())).thenAnswer(inv -> inv.getArgument(0));

    var tariff =
        service.updateTariff(
            propertyId,
            new BigDecimal("3500"),
            new BigDecimal("25000"),
            new BigDecimal("100000"),
            new BigDecimal("30000"),
            new BigDecimal("20000"),
            landlord);

    assertNotNull(tariff);
    assertEquals(new BigDecimal("3500"), tariff.electricityRate);
    assertEquals(new BigDecimal("25000"), tariff.waterRate);
  }

  @Test
  void updateTariff_rejectsNegativeRate() {
    assertThrows(
        ApiFailure.class,
        () ->
            service.updateTariff(
                propertyId,
                new BigDecimal("-100"),
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                BigDecimal.ZERO,
                landlord));
  }

  @Test
  void recordReading_calculatesAmountsCorrectly() {
    var tariff = new ServiceTariff();
    tariff.propertyId = propertyId;
    tariff.electricityRate = new BigDecimal("3500");
    tariff.waterRate = new BigDecimal("25000");
    tariff.internetFee = new BigDecimal("100000");
    tariff.garbageFee = new BigDecimal("30000");
    tariff.otherFees = new BigDecimal("20000");
    when(repo.findTariffByProperty(propertyId)).thenReturn(tariff);
    when(repo.saveReading(any())).thenAnswer(inv -> inv.getArgument(0));

    var period = LocalDate.of(2026, 10, 1);
    var reading =
        service.recordReading(
            roomId,
            contractId,
            period,
            LocalDate.of(2026, 10, 2),
            new BigDecimal("100.00"),
            new BigDecimal("150.00"), // 50 kWh * 3500 = 175,000 VND
            new BigDecimal("10.00"),
            new BigDecimal("14.00"), // 4 m3 * 25000 = 100,000 VND
            landlord);

    assertNotNull(reading);
    assertEquals(new BigDecimal("175000"), reading.electricityAmount);
    assertEquals(new BigDecimal("100000"), reading.waterAmount);
    assertEquals(new BigDecimal("150000"), reading.servicesAmount);
    assertEquals(new BigDecimal("425000"), reading.totalUtilityAmount);
  }

  @Test
  void recordReading_rejectsDecreasingMeter() {
    assertThrows(
        ApiFailure.class,
        () ->
            service.recordReading(
                roomId,
                contractId,
                LocalDate.of(2026, 10, 1),
                LocalDate.now(),
                new BigDecimal("100.00"),
                new BigDecimal("90.00"), // Decreasing electricity
                new BigDecimal("10.00"),
                new BigDecimal("12.00"),
                landlord));
  }

  @Test
  void recordReading_rejectsNonFirstDayOfMonth() {
    assertThrows(
        ApiFailure.class,
        () ->
            service.recordReading(
                roomId,
                contractId,
                LocalDate.of(2026, 10, 15), // Not day 1
                LocalDate.now(),
                new BigDecimal("100.00"),
                new BigDecimal("150.00"),
                new BigDecimal("10.00"),
                new BigDecimal("12.00"),
                landlord));
  }
}
