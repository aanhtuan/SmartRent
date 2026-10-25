package com.smartrent.room.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.property.application.PropertyAccess;
import com.smartrent.room.domain.*;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.Inputs;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class RoomService {
  private final RoomRepository repo;
  private final RoomAccess access;
  private final PropertyAccess properties;
  private final RoomLifecycleGuard guard;

  public RoomService(
      RoomRepository repo, RoomAccess access, PropertyAccess properties, RoomLifecycleGuard guard) {
    this.repo = repo;
    this.access = access;
    this.properties = properties;
    this.guard = guard;
  }

  @Transactional(readOnly = true)
  public PageResponse<Room> list(Actor a, UUID property, int page, int size) {
    properties.owned(property, a);
    return new PageResponse<>(
        repo.visible(a.id(), true, property, null, PageResponse.offset(page, size), size),
        page,
        size);
  }

  @Transactional
  public Room create(Actor a, UUID property, String code) {
    var p = properties.lock(property, a);
    if (!p.status.equals("ACTIVE")) throw ApiFailure.state();
    var r = new Room();
    r.propertyId = property;
    r.roomCode = Inputs.text(code, 80).strip();
    r.status = "AVAILABLE";
    return repo.save(r);
  }

  @Transactional
  public Room update(Actor a, UUID id, String code, String status) {
    a.requireLandlord();
    var r = access.lock(id, a);
    if (code == null && status == null) throw ApiFailure.invalid();
    if (code != null) r.roomCode = Inputs.text(code, 80).strip();
    if (status != null) {
      Inputs.choice(status, "AVAILABLE", "INACTIVE");
      if (status.equals("INACTIVE")) guard.ensureDeactivationAllowed(id);
      if (status.equals("AVAILABLE") && guard.occupied(id)) throw ApiFailure.state();
      if (status.equals("AVAILABLE") && !properties.internal(r.propertyId).status.equals("ACTIVE"))
        throw ApiFailure.state();
      r.status = status;
    }
    return repo.save(r);
  }
}
