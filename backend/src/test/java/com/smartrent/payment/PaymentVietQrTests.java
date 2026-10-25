package com.smartrent.payment;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.smartrent.contract.application.ContractAccess;
import com.smartrent.contract.domain.Contract;
import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.payment.domain.*;
import com.smartrent.property.application.PropertyAccess;
import com.smartrent.property.domain.Property;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.room.domain.Room;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.tenant.application.TenantAccess;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class PaymentVietQrTests {
  private PaymentRepository repo;
  private ContractAccess contracts;
  private TenantAccess tenants;
  private RoomAccess rooms;
  private PropertyAccess properties;
  private ApplicationEventPublisher events;
  private PaymentService service;

  private final UUID landlordId = UUID.randomUUID();
  private final Actor landlord = new Actor(landlordId, AccountRole.LANDLORD);
  private final UUID propertyId = UUID.randomUUID();
  private final UUID roomId = UUID.randomUUID();
  private final UUID contractId = UUID.randomUUID();

  @BeforeEach
  void setUp() {
    repo = mock(PaymentRepository.class);
    contracts = mock(ContractAccess.class);
    tenants = mock(TenantAccess.class);
    rooms = mock(RoomAccess.class);
    properties = mock(PropertyAccess.class);
    events = mock(ApplicationEventPublisher.class);
    Clock clock = Clock.fixed(Instant.parse("2026-10-25T10:00:00Z"), ZoneId.of("UTC"));
    service = new PaymentService(repo, contracts, tenants, rooms, properties, clock, events);
  }

  @Test
  void updateBankAccount_savesAndReturns() {
    when(repo.saveBankAccount(any())).thenAnswer(inv -> inv.getArgument(0));

    var account =
        service.updateBankAccount(
            landlord, "970422", "MBBank", "0123456789", "NGUYEN VAN A");

    assertNotNull(account);
    assertEquals("970422", account.bankBin);
    assertEquals("0123456789", account.accountNumber);
    assertEquals("NGUYEN VAN A", account.accountHolderName);
  }

  @Test
  void getVietQrUrl_generatesValidUrl() {
    var payment = new Payment();
    payment.id = UUID.randomUUID();
    payment.contractId = contractId;
    payment.amount = new BigDecimal("3500000");
    payment.paymentReference = "SR98765432";

    var contract = new Contract();
    contract.id = contractId;
    contract.roomId = roomId;
    when(contracts.internal(contractId)).thenReturn(contract);

    var room = new Room();
    room.id = roomId;
    room.propertyId = propertyId;
    when(rooms.internal(roomId)).thenReturn(room);

    var prop = new Property();
    prop.id = propertyId;
    prop.ownerUserId = landlordId;
    when(properties.internal(propertyId)).thenReturn(prop);

    var bank = new LandlordBankAccount();
    bank.bankBin = "970422";
    bank.accountNumber = "0123456789";
    bank.accountHolderName = "NGUYEN VAN A";
    when(repo.findBankAccountByLandlord(landlordId)).thenReturn(bank);

    var qrUrl = service.getVietQrUrl(payment);
    assertNotNull(qrUrl);
    assertTrue(qrUrl.contains("970422-0123456789-compact2.png"));
    assertTrue(qrUrl.contains("amount=3500000"));
    assertTrue(qrUrl.contains("addInfo=SR98765432"));
  }

  @Test
  void processWebhookPayment_updatesStatusToPaid() {
    var payment = new Payment();
    payment.id = UUID.randomUUID();
    payment.contractId = contractId;
    payment.amount = new BigDecimal("2500000");
    payment.paymentReference = "SR11223344";
    payment.status = "PENDING";
    when(repo.findByReference("SR11223344")).thenReturn(payment);
    when(repo.save(any())).thenAnswer(inv -> inv.getArgument(0));

    var contract = new Contract();
    contract.id = contractId;
    contract.tenantProfileId = UUID.randomUUID();
    when(contracts.internal(contractId)).thenReturn(contract);
    when(tenants.user(contract.tenantProfileId)).thenReturn(UUID.randomUUID());

    var result = service.processWebhookPayment("SR11223344", new BigDecimal("2500000"));
    assertEquals("PAID", result.status);
    verify(events).publishEvent(any(Object.class));
  }

  @Test
  void processWebhookPayment_rejectsMismatchedAmount() {
    var payment = new Payment();
    payment.amount = new BigDecimal("2500000");
    payment.paymentReference = "SR11223344";
    when(repo.findByReference("SR11223344")).thenReturn(payment);

    assertThrows(
        ApiFailure.class,
        () -> service.processWebhookPayment("SR11223344", new BigDecimal("1000000")));
  }
}
