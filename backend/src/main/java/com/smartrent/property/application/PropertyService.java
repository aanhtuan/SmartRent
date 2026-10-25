package com.smartrent.property.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.property.domain.*;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.Inputs;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class PropertyService {
  private final PropertyRepository repo;
  private final PropertyAccess access;
  private final RoomAccess rooms;

  public PropertyService(PropertyRepository repo, PropertyAccess access, RoomAccess rooms) {
    this.repo = repo;
    this.access = access;
    this.rooms = rooms;
  }

  @Transactional(readOnly = true)
  public PageResponse<Property> list(Actor a, int page, int size) {
    a.requireLandlord();
    return new PageResponse<>(
        repo.visible(a.id(), true, null, null, PageResponse.offset(page, size), size), page, size);
  }

  @Transactional
  public Property create(Actor a, String name, String address, String status) {
    a.requireLandlord();
    var p = new Property();
    p.ownerUserId = a.id();
    p.name = Inputs.text(name, 200);
    p.address = Inputs.text(address, 2000);
    p.status = status == null ? "ACTIVE" : Inputs.choice(status, "ACTIVE", "INACTIVE");
    return repo.save(p);
  }

  @Transactional
  public Property update(Actor a, UUID id, String name, String address, String status) {
    var p = access.lock(id, a);
    if (name == null && address == null && status == null) throw ApiFailure.invalid();
    if (name != null) p.name = Inputs.text(name, 200);
    if (address != null) p.address = Inputs.text(address, 2000);
    if (status != null) {
      Inputs.choice(status, "ACTIVE", "INACTIVE");
      if (status.equals("INACTIVE")) rooms.lockPropertyRooms(id, a);
      p.status = status;
    }
    return repo.save(p);
  }
}
