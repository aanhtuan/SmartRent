package com.smartrent.tenant.application;

import com.smartrent.identity.application.*;
import com.smartrent.identity.domain.AccountRole;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.Inputs;
import com.smartrent.tenant.domain.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class TenantService {
  private final TenantRepository repo;
  private final TenantAccess access;
  private final IdentityQueries identities;

  public TenantService(TenantRepository r, TenantAccess a, IdentityQueries i) {
    repo = r;
    access = a;
    identities = i;
  }

  @Transactional(readOnly = true)
  public PageResponse<Tenant> list(Actor a, int page, int size) {
    a.requireLandlord();
    return new PageResponse<>(
        repo.visible(a.id(), true, null, null, PageResponse.offset(page, size), size), page, size);
  }

  @Transactional
  public Tenant create(Actor a, UUID user, String name, String phone) {
    a.requireLandlord();
    if (user == null || !identities.assigned(user, a.id())) throw ApiFailure.missing();
    if (identities.active(user).role() != AccountRole.TENANT) throw ApiFailure.missing();
    var t = new Tenant();
    t.userId = user;
    t.managerLandlordId = a.id();
    t.fullName = Inputs.text(name, 200);
    Inputs.phone(phone);
    t.phoneNumber = phone;
    return repo.save(t);
  }

  @Transactional
  public Tenant update(Actor a, UUID id, String name, String phone, boolean updatePhone) {
    access.visible(id, a);
    var t = repo.find(id, true);
    if (name == null && !updatePhone) throw ApiFailure.invalid();
    if (name != null) t.fullName = Inputs.text(name, 200);
    Inputs.phone(phone);
    if (updatePhone) t.phoneNumber = phone;
    return repo.save(t);
  }
}
