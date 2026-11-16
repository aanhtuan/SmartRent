package com.smartrent.inventory.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface InventoryRepository {
  Optional<Deposit> findDepositById(UUID id);

  Optional<Deposit> findDepositByContractId(UUID contractId);

  Deposit saveDeposit(Deposit deposit);

  List<RoomAsset> findAssetsByRoomId(UUID roomId);

  Optional<RoomAsset> findAssetById(UUID id);

  RoomAsset saveAsset(RoomAsset asset);

  void deleteAsset(UUID id);
}
