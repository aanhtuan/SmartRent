package com.smartrent.tenant.persistence;

import com.smartrent.tenant.domain.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaTenantAdapter implements TenantRepository {
  @PersistenceContext EntityManager em;

  public Tenant find(UUID id, boolean lock) {
    var e = em.find(TenantRecord.class, id);
    if (e == null) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public Tenant save(Tenant v) {
    var e = v.id == null ? null : em.find(TenantRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new TenantRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.userId = v.userId;
    e.managerLandlordId = v.managerLandlordId;
    e.fullName = v.fullName;
    e.phoneNumber = v.phoneNumber;
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  public List<Tenant> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit) {
    var q =
        em.createNativeQuery(
            "SELECT x.* FROM tenant_profiles x WHERE ((:landlord AND x.manager_landlord_id=:actor)"
                + " OR (NOT :landlord AND x.user_id=:actor))  ORDER BY x.created_at,x.id",
            TenantRecord.class);
    q.setParameter("actor", actor);
    q.setParameter("landlord", landlord);
    return ((List<TenantRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }

  private Tenant model(TenantRecord e) {
    var v = new Tenant();
    v.id = e.id;
    v.userId = e.userId;
    v.managerLandlordId = e.managerLandlordId;
    v.fullName = e.fullName;
    v.phoneNumber = e.phoneNumber;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }
}
