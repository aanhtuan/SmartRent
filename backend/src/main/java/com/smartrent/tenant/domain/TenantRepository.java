package com.smartrent.tenant.domain;

import java.util.*;

public interface TenantRepository {
  Tenant find(UUID id, boolean lock);

  Tenant save(Tenant value);

  List<Tenant> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit);
}
