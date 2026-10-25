package com.smartrent.tenant.application;

import com.smartrent.identity.application.*;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.tenant.domain.*;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class TenantAccess {
  private final TenantRepository repo;

  public TenantAccess(TenantRepository repo) {
    this.repo = repo;
  }

  @Transactional(readOnly = true)
  public Tenant visible(UUID id, Actor a) {
    var t = repo.find(id, false);
    if (t == null || !(a.landlord() ? t.managerLandlordId.equals(a.id()) : t.userId.equals(a.id())))
      throw ApiFailure.missing();
    return t;
  }

  @Transactional(readOnly = true)
  public Tenant managed(UUID id, Actor a) {
    a.requireLandlord();
    return visible(id, a);
  }

  @Transactional(readOnly = true)
  public Tenant own(Actor a) {
    return repo.visible(a.id(), false, null, null, 0, 1).stream()
        .findFirst()
        .orElseThrow(ApiFailure::missing);
  }

  @Transactional(readOnly = true)
  public UUID user(UUID id) {
    var t = repo.find(id, false);
    if (t == null) throw ApiFailure.missing();
    return t.userId;
  }
}
