package com.smartrent.inventory.persistence;

import com.smartrent.inventory.domain.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaInventoryAdapter implements InventoryRepository {
  @PersistenceContext EntityManager em;

  private Deposit toDomain(DepositRecord r) {
    if (r == null) return null;
    return new Deposit(
        r.id,
        r.contractId,
        r.amount,
        r.status,
        r.refundAmount,
        r.deductionAmount,
        r.deductionReason,
        r.heldAt,
        r.resolvedAt,
        r.createdAt,
        r.updatedAt);
  }

  private RoomAsset toDomain(RoomAssetRecord r) {
    if (r == null) return null;
    return new RoomAsset(
        r.id,
        r.roomId,
        r.name,
        r.assetCode,
        r.conditionStatus,
        r.initialNotes,
        r.handoverNotes,
        r.createdAt,
        r.updatedAt);
  }

  @Override
  public Optional<Deposit> findDepositById(UUID id) {
    var r = em.find(DepositRecord.class, id);
    return Optional.ofNullable(toDomain(r));
  }

  @Override
  public Optional<Deposit> findDepositByContractId(UUID contractId) {
    var q =
        em.createQuery(
            "SELECT d FROM DepositRecord d WHERE d.contractId = :contractId", DepositRecord.class);
    q.setParameter("contractId", contractId);
    var list = q.getResultList();
    return list.isEmpty() ? Optional.empty() : Optional.of(toDomain(list.get(0)));
  }

  @Override
  public Deposit saveDeposit(Deposit deposit) {
    DepositRecord r = null;
    boolean fresh = false;
    if (deposit.id != null) {
      r = em.find(DepositRecord.class, deposit.id);
    }
    if (r == null) {
      r = new DepositRecord();
      r.id = deposit.id == null ? UUID.randomUUID() : deposit.id;
      fresh = true;
    }
    r.contractId = deposit.contractId;
    r.amount = deposit.amount;
    r.status = deposit.status;
    r.refundAmount = deposit.refundAmount;
    r.deductionAmount = deposit.deductionAmount;
    r.deductionReason = deposit.deductionReason;
    r.heldAt = deposit.heldAt == null ? Instant.now() : deposit.heldAt;
    r.resolvedAt = deposit.resolvedAt;

    if (fresh) em.persist(r);
    em.flush();
    return toDomain(r);
  }

  @Override
  public List<RoomAsset> findAssetsByRoomId(UUID roomId) {
    var q =
        em.createQuery(
            "SELECT a FROM RoomAssetRecord a WHERE a.roomId = :roomId ORDER BY a.createdAt ASC",
            RoomAssetRecord.class);
    q.setParameter("roomId", roomId);
    return q.getResultList().stream().map(this::toDomain).toList();
  }

  @Override
  public Optional<RoomAsset> findAssetById(UUID id) {
    var r = em.find(RoomAssetRecord.class, id);
    return Optional.ofNullable(toDomain(r));
  }

  @Override
  public RoomAsset saveAsset(RoomAsset asset) {
    RoomAssetRecord r = null;
    boolean fresh = false;
    if (asset.id != null) {
      r = em.find(RoomAssetRecord.class, asset.id);
    }
    if (r == null) {
      r = new RoomAssetRecord();
      r.id = asset.id == null ? UUID.randomUUID() : asset.id;
      fresh = true;
    }
    r.roomId = asset.roomId;
    r.name = asset.name;
    r.assetCode = asset.assetCode;
    r.conditionStatus = asset.conditionStatus;
    r.initialNotes = asset.initialNotes;
    r.handoverNotes = asset.handoverNotes;

    if (fresh) em.persist(r);
    em.flush();
    return toDomain(r);
  }

  @Override
  public void deleteAsset(UUID id) {
    var r = em.find(RoomAssetRecord.class, id);
    if (r != null) {
      em.remove(r);
      em.flush();
    }
  }
}
