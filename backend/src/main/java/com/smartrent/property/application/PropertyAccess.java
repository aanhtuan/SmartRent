package com.smartrent.property.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.property.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class PropertyAccess {
  private final PropertyRepository repo;

  public PropertyAccess(PropertyRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public Property owned(UUID id, Actor actor) {
    actor.requireLandlord();
    var p = repo.find(id, false);
    if (p == null || !p.ownerUserId.equals(actor.id())) throw ApiFailure.missing();
    return p;
  }

  @Transactional
  public Property lock(UUID id, Actor actor) {
    actor.requireLandlord();
    var p = repo.find(id, true);
    if (p == null || !p.ownerUserId.equals(actor.id())) throw ApiFailure.missing();
    return p;
  }

  @Transactional(readOnly = true)
  public Property internal(UUID id) {
    var p = repo.find(id, false);
    if (p == null) throw ApiFailure.missing();
    return p;
  }
}
