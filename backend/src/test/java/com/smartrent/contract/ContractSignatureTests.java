package com.smartrent.contract;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.smartrent.contract.application.*;
import com.smartrent.contract.domain.*;
import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.tenant.application.TenantAccess;
import java.time.*;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.ApplicationEventPublisher;

class ContractSignatureTests {
  private ContractRepository repo;
  private ContractAccess access;
  private ContractQueries queries;
  private RoomAccess rooms;
  private TenantAccess tenants;
  private ContractBillingGuard billing;
  private Clock clock;
  private ApplicationEventPublisher events;
  private ContractService service;

  private final UUID landlordId = UUID.randomUUID();
  private final UUID tenantUserId = UUID.randomUUID();
  private final UUID tenantProfileId = UUID.randomUUID();
  private final UUID roomId = UUID.randomUUID();
  private final UUID contractId = UUID.randomUUID();

  private final Actor landlord = new Actor(landlordId, AccountRole.LANDLORD);
  private final Actor tenant = new Actor(tenantUserId, AccountRole.TENANT);
  private final Actor stranger = new Actor(UUID.randomUUID(), AccountRole.TENANT);

  private Contract sampleContract;

  @BeforeEach
  void setUp() {
    repo = mock(ContractRepository.class);
    access = mock(ContractAccess.class);
    queries = mock(ContractQueries.class);
    rooms = mock(RoomAccess.class);
    tenants = mock(TenantAccess.class);
    billing = mock(ContractBillingGuard.class);
    clock = Clock.fixed(Instant.parse("2026-10-26T10:00:00Z"), ZoneOffset.UTC);
    events = mock(ApplicationEventPublisher.class);

    service =
        new ContractService(repo, access, queries, rooms, tenants, billing, clock, events);

    sampleContract = new Contract();
    sampleContract.id = contractId;
    sampleContract.roomId = roomId;
    sampleContract.tenantProfileId = tenantProfileId;
    sampleContract.startDate = LocalDate.of(2026, 11, 1);
    sampleContract.endDate = LocalDate.of(2027, 11, 1);
    sampleContract.status = "ACTIVE";

    when(repo.find(contractId, true)).thenReturn(sampleContract);
    when(repo.save(any(Contract.class))).thenAnswer(inv -> inv.getArgument(0));
    when(tenants.user(tenantProfileId)).thenReturn(tenantUserId);
  }

  @Test
  void landlordSignsContractSuccessfully() {
    String sigData = "data:image/png;base64,landlordSig...";

    Contract signed = service.sign(landlord, contractId, sigData);

    assertThat(signed.landlordSignature).isEqualTo(sigData);
    assertThat(signed.landlordSignedAt).isEqualTo(Instant.now(clock));
    verify(rooms).owned(roomId, landlord);
    verify(repo).save(signed);
  }

  @Test
  void tenantSignsContractSuccessfully() {
    String sigData = "data:image/png;base64,tenantSig...";

    Contract signed = service.sign(tenant, contractId, sigData);

    assertThat(signed.tenantSignature).isEqualTo(sigData);
    assertThat(signed.tenantSignedAt).isEqualTo(Instant.now(clock));
    verify(tenants, atLeastOnce()).user(tenantProfileId);
    verify(repo).save(signed);
  }

  @Test
  void unauthorizedStrangerCannotSignContract() {
    String sigData = "data:image/png;base64,strangerSig...";

    assertThatThrownBy(() -> service.sign(stranger, contractId, sigData))
        .isInstanceOf(ApiFailure.class)
        .hasFieldOrPropertyWithValue("status", 403);
  }
}
