package com.smartrent.inventory;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.smartrent.identity.application.Actor;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.inventory.application.InventoryService;
import com.smartrent.inventory.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class InventoryServiceTests {
  private InventoryRepository repo;
  private InventoryService service;

  private final Actor landlord = new Actor(UUID.randomUUID(), AccountRole.LANDLORD);
  private final Actor tenant = new Actor(UUID.randomUUID(), AccountRole.TENANT);

  @BeforeEach
  void setUp() {
    repo = mock(InventoryRepository.class);
    service = new InventoryService(repo);
  }

  @Test
  void landlordRecordsDepositSuccessfully() {
    UUID contractId = UUID.randomUUID();
    when(repo.findDepositByContractId(contractId)).thenReturn(Optional.empty());
    when(repo.saveDeposit(any(Deposit.class))).thenAnswer(inv -> inv.getArgument(0));

    Deposit deposit = service.recordDeposit(landlord, contractId, 5_000_000L);

    assertThat(deposit).isNotNull();
    assertThat(deposit.contractId).isEqualTo(contractId);
    assertThat(deposit.amount).isEqualTo(5_000_000L);
    assertThat(deposit.status).isEqualTo("HELD");
    verify(repo).saveDeposit(any(Deposit.class));
  }

  @Test
  void tenantCannotRecordDeposit() {
    UUID contractId = UUID.randomUUID();

    assertThatThrownBy(() -> service.recordDeposit(tenant, contractId, 3_000_000L))
        .isInstanceOf(ApiFailure.class)
        .hasFieldOrPropertyWithValue("status", 403);
  }

  @Test
  void landlordResolvesDepositWithDeduction() {
    UUID depositId = UUID.randomUUID();
    Deposit held =
        new Deposit(
            depositId,
            UUID.randomUUID(),
            5_000_000L,
            "HELD",
            0,
            0,
            null,
            Instant.now(),
            null,
            Instant.now(),
            Instant.now());

    when(repo.findDepositById(depositId)).thenReturn(Optional.of(held));
    when(repo.saveDeposit(any(Deposit.class))).thenAnswer(inv -> inv.getArgument(0));

    Deposit resolved =
        service.resolveDeposit(
            landlord, depositId, 4_000_000L, 1_000_000L, "Trừ tiền hỏng rèm cửa");

    assertThat(resolved.status).isEqualTo("DEDUCTED");
    assertThat(resolved.refundAmount).isEqualTo(4_000_000L);
    assertThat(resolved.deductionAmount).isEqualTo(1_000_000L);
    assertThat(resolved.deductionReason).isEqualTo("Trừ tiền hỏng rèm cửa");
    assertThat(resolved.resolvedAt).isNotNull();
  }

  @Test
  void resolvingDepositExceedingTotalFails() {
    UUID depositId = UUID.randomUUID();
    Deposit held =
        new Deposit(
            depositId,
            UUID.randomUUID(),
            3_000_000L,
            "HELD",
            0,
            0,
            null,
            Instant.now(),
            null,
            Instant.now(),
            Instant.now());

    when(repo.findDepositById(depositId)).thenReturn(Optional.of(held));

    assertThatThrownBy(
            () ->
                service.resolveDeposit(
                    landlord, depositId, 2_000_000L, 2_000_000L, "Tổng vượt tiền cọc"))
        .isInstanceOf(ApiFailure.class)
        .hasFieldOrPropertyWithValue("status", 400);
  }

  @Test
  void landlordManagesRoomAssets() {
    UUID roomId = UUID.randomUUID();
    when(repo.saveAsset(any(RoomAsset.class))).thenAnswer(inv -> inv.getArgument(0));

    RoomAsset created =
        service.createAsset(
            landlord, roomId, "Điều hòa Daikin", "DK-01", "EXCELLENT", "Mới tinh 100%");

    assertThat(created.roomId).isEqualTo(roomId);
    assertThat(created.name).isEqualTo("Điều hòa Daikin");
    assertThat(created.conditionStatus).isEqualTo("EXCELLENT");

    when(repo.findAssetById(created.id)).thenReturn(Optional.of(created));

    RoomAsset updated =
        service.updateAsset(
            landlord, created.id, null, null, "FAIR", null, "Bộ lọc cần vệ sinh");

    assertThat(updated.conditionStatus).isEqualTo("FAIR");
    assertThat(updated.handoverNotes).isEqualTo("Bộ lọc cần vệ sinh");

    service.deleteAsset(landlord, created.id);
    verify(repo).deleteAsset(created.id);
  }
}
