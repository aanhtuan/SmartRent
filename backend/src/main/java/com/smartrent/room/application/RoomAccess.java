package com.smartrent.room.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.property.application.PropertyAccess;
import com.smartrent.room.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class RoomAccess {
  private final RoomRepository repo;
  private final PropertyAccess properties;
  private final RoomLifecycleGuard guard;

  public RoomAccess(RoomRepository repo, PropertyAccess properties, RoomLifecycleGuard guard) {
    this.repo = repo;
    this.properties = properties;
    this.guard = guard;
  }

  @Transactional(readOnly = true)
  public Room owned(UUID id, Actor actor) {
    var r = internal(id);
    properties.owned(r.propertyId, actor);
    return r;
  }

  @Transactional
  public Room lock(UUID id, Actor actor) {
    var r = internal(id);
    properties.lock(r.propertyId, actor);
    r = repo.find(id, true);
    return r;
  }

  @Transactional
  public Room lockForTenancy(UUID id) {
    var r = internal(id);
    var p = properties.internal(r.propertyId);
    properties.lock(
        p.id, new Actor(p.ownerUserId, com.smartrent.identity.domain.AccountRole.LANDLORD));
    return repo.find(id, true);
  }

  @Transactional(readOnly = true)
  public Room internal(UUID id) {
    var r = repo.find(id, false);
    if (r == null) throw ApiFailure.missing();
    return r;
  }

  @Transactional(readOnly = true)
  public UUID owner(UUID id) {
    return properties.internal(internal(id).propertyId).ownerUserId;
  }

  @Transactional(readOnly = true)
  public boolean active(UUID id) {
    var r = internal(id);
    return !r.status.equals("INACTIVE")
        && properties.internal(r.propertyId).status.equals("ACTIVE");
  }

  @Transactional(readOnly = true)
  public java.util.Set<UUID> occupiedRooms(java.util.Collection<UUID> rooms) {
    return guard.occupiedRooms(rooms);
  }

  @Transactional(readOnly = true)
  public String status(Room r) {
    return r.status.equals("INACTIVE")
        ? "INACTIVE"
        : guard.occupied(r.id) ? "OCCUPIED" : "AVAILABLE";
  }

  @Transactional(readOnly = true)
  public Room visible(UUID id, Actor a) {
    if (a.landlord()) return owned(id, a);
    if (!active(id) || !guard.entitled(id, a.id())) throw ApiFailure.missing();
    return internal(id);
  }

  @Transactional
  public void lockPropertyRooms(UUID id, Actor a) {
    for (var r :
        repo.visible(a.id(), true, id, null, 0, Integer.MAX_VALUE).stream()
            .sorted(java.util.Comparator.comparing(v -> v.id))
            .toList()) {
      repo.find(r.id, true);
      guard.ensureDeactivationAllowed(r.id);
    }
  }
}
