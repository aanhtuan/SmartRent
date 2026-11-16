package com.smartrent.maintenance.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.maintenance.domain.*;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.*;
import com.smartrent.tenant.application.TenantAccess;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class MaintenanceQueries {
  private final MaintenanceRepository repo;
  private final TenantAccess tenants;
  private final RoomAccess rooms;

  public MaintenanceQueries(MaintenanceRepository r, TenantAccess t, RoomAccess rooms) {
    repo = r;
    tenants = t;
    this.rooms = rooms;
  }

  @Transactional(readOnly = true)
  public boolean open(UUID room) {
    return repo.open(room);
  }

  @Transactional(readOnly = true)
  public Maintenance visible(UUID id, Actor a) {
    var m = repo.find(id, false);
    if (m == null) throw ApiFailure.missing();
    if (a.landlord()) rooms.owned(m.roomId, a);
    else if (!tenants.user(m.tenantProfileId).equals(a.id())) throw ApiFailure.missing();
    return m;
  }

  @Transactional(readOnly = true)
  public PageResponse<Maintenance> list(
      Actor a, UUID room, String status, int page, int size, String priority) {
    if (room != null) {
      if (a.landlord()) rooms.owned(room, a);
      else if (!repo.canFilterRoom(room, a.id())) rooms.visible(room, a);
    }
    if (priority != null)
      com.smartrent.shared.application.Inputs.choice(priority, "LOW", "MEDIUM", "HIGH");
    if (status != null)
      com.smartrent.shared.application.Inputs.choice(
          status, "PENDING", "PROCESSING", "COMPLETED", "CANCELLED");
    return new PageResponse<>(
        repo.filtered(
            a.id(), a.landlord(), room, status, priority, PageResponse.offset(page, size), size),
        page,
        size);
  }
}
