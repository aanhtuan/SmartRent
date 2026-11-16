package com.smartrent.room.application;

import com.smartrent.contract.application.ContractQueries;
import com.smartrent.maintenance.application.MaintenanceStateQueries;
import com.smartrent.shared.api.ApiFailure;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!foundation-test")
class RentalLifecycleGuard implements RoomLifecycleGuard {
  private final ContractQueries contracts;
  private final MaintenanceStateQueries maintenance;

  RentalLifecycleGuard(ContractQueries c, MaintenanceStateQueries m) {
    contracts = c;
    maintenance = m;
  }

  public void ensureDeactivationAllowed(UUID room) {
    if (contracts.reserved(room) || maintenance.open(room)) throw ApiFailure.state();
  }

  public java.util.Set<UUID> occupiedRooms(java.util.Collection<UUID> rooms) {
    return contracts.occupiedRooms(rooms);
  }

  public boolean occupied(UUID room) {
    return contracts.occupied(room);
  }

  public boolean entitled(UUID room, UUID user) {
    return contracts.entitled(room, user);
  }
}
