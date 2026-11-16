package com.smartrent.inventory.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.inventory.domain.Deposit;
import com.smartrent.inventory.domain.InventoryRepository;
import com.smartrent.inventory.domain.RoomAsset;
import com.smartrent.shared.api.ApiFailure;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class InventoryService {
  private final InventoryRepository repo;

  public InventoryService(InventoryRepository repo) {
    this.repo = repo;
  }

  public Deposit recordDeposit(Actor actor, UUID contractId, long amount) {
    actor.requireLandlord();
    if (contractId == null || amount < 0) throw ApiFailure.invalid();

    var existing = repo.findDepositByContractId(contractId);
    if (existing.isPresent()) {
      var d = existing.get();
      d.amount = amount;
      return repo.saveDeposit(d);
    }

    var deposit =
        new Deposit(
            UUID.randomUUID(),
            contractId,
            amount,
            "HELD",
            0,
            0,
            null,
            Instant.now(),
            null,
            Instant.now(),
            Instant.now());
    return repo.saveDeposit(deposit);
  }

  public Deposit resolveDeposit(
      Actor actor,
      UUID depositId,
      long refundAmount,
      long deductionAmount,
      String deductionReason) {
    actor.requireLandlord();
    if (depositId == null || refundAmount < 0 || deductionAmount < 0) {
      throw ApiFailure.invalid();
    }

    var deposit =
        repo.findDepositById(depositId)
            .orElseThrow(() -> new ApiFailure(404, "NOT_FOUND", "Deposit record not found."));

    if (!"HELD".equals(deposit.status)) {
      throw new ApiFailure(400, "ALREADY_RESOLVED", "Deposit has already been resolved.");
    }

    if (refundAmount + deductionAmount > deposit.amount) {
      throw new ApiFailure(
          400,
          "EXCEEDS_DEPOSIT",
          "Total refund and deduction cannot exceed the original deposit amount.");
    }

    deposit.refundAmount = refundAmount;
    deposit.deductionAmount = deductionAmount;
    deposit.deductionReason = deductionReason;
    deposit.status = deductionAmount > 0 ? "DEDUCTED" : "REFUNDED";
    deposit.resolvedAt = Instant.now();

    return repo.saveDeposit(deposit);
  }

  @Transactional(readOnly = true)
  public Deposit getDepositByContract(Actor actor, UUID contractId) {
    if (contractId == null) throw ApiFailure.invalid();
    return repo.findDepositByContractId(contractId)
        .orElse(null);
  }

  @Transactional(readOnly = true)
  public List<RoomAsset> listAssets(Actor actor, UUID roomId) {
    if (roomId == null) throw ApiFailure.invalid();
    return repo.findAssetsByRoomId(roomId);
  }

  public RoomAsset createAsset(
      Actor actor,
      UUID roomId,
      String name,
      String assetCode,
      String conditionStatus,
      String initialNotes) {
    actor.requireLandlord();
    if (roomId == null || name == null || name.isBlank()) throw ApiFailure.invalid();

    String condition = (conditionStatus == null || conditionStatus.isBlank()) ? "GOOD" : conditionStatus;
    var asset =
        new RoomAsset(
            UUID.randomUUID(),
            roomId,
            name.trim(),
            assetCode != null ? assetCode.trim() : null,
            condition,
            initialNotes,
            null,
            Instant.now(),
            Instant.now());
    return repo.saveAsset(asset);
  }

  public RoomAsset updateAsset(
      Actor actor,
      UUID assetId,
      String name,
      String assetCode,
      String conditionStatus,
      String initialNotes,
      String handoverNotes) {
    actor.requireLandlord();
    if (assetId == null) throw ApiFailure.invalid();

    var asset =
        repo.findAssetById(assetId)
            .orElseThrow(() -> new ApiFailure(404, "NOT_FOUND", "Asset not found."));

    if (name != null && !name.isBlank()) asset.name = name.trim();
    if (assetCode != null) asset.assetCode = assetCode.trim();
    if (conditionStatus != null && !conditionStatus.isBlank()) asset.conditionStatus = conditionStatus;
    if (initialNotes != null) asset.initialNotes = initialNotes;
    if (handoverNotes != null) asset.handoverNotes = handoverNotes;

    return repo.saveAsset(asset);
  }

  public void deleteAsset(Actor actor, UUID assetId) {
    actor.requireLandlord();
    if (assetId == null) throw ApiFailure.invalid();
    repo.deleteAsset(assetId);
  }
}
