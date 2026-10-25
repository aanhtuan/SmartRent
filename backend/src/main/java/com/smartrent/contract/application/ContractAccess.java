package com.smartrent.contract.application;

import com.smartrent.contract.domain.*;
import com.smartrent.identity.application.Actor;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.ApiFailure;
import com.smartrent.tenant.application.TenantAccess;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class ContractAccess {
  private final ContractRepository repo;
  private final RoomAccess rooms;
  private final TenantAccess tenants;

  public ContractAccess(ContractRepository r, RoomAccess a, TenantAccess t) {
    repo = r;
    rooms = a;
    tenants = t;
  }

  @Transactional(readOnly = true)
  public Contract visible(UUID id, Actor a) {
    var c = repo.find(id, false);
    if (c == null) throw ApiFailure.missing();
    if (a.landlord()) rooms.owned(c.roomId, a);
    else if (!tenants.user(c.tenantProfileId).equals(a.id())) throw ApiFailure.missing();
    return c;
  }

  @Transactional
  public Contract lockOwned(UUID id, Actor a) {
    a.requireLandlord();
    var c = visible(id, a);
    rooms.lock(c.roomId, a);
    return repo.find(id, true);
  }

  @Transactional(readOnly = true)
  public Contract internal(UUID id) {
    var c = repo.find(id, false);
    if (c == null) throw ApiFailure.missing();
    return c;
  }
}
