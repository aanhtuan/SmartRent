package com.smartrent.property.persistence;

import com.smartrent.property.domain.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaPropertyAdapter implements PropertyRepository {
  @PersistenceContext EntityManager em;

  public Property find(UUID id, boolean lock) {
    var e = em.find(PropertyRecord.class, id);
    if (e == null) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public Property save(Property v) {
    var e = v.id == null ? null : em.find(PropertyRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new PropertyRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.ownerUserId = v.ownerUserId;
    e.name = v.name;
    e.address = v.address;
    e.status = v.status;
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  public List<Property> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit) {
    var q =
        em.createNativeQuery(
            "SELECT x.* FROM properties x WHERE (:landlord AND x.owner_user_id=:actor)  ORDER BY"
                + " x.created_at,x.id",
            PropertyRecord.class);
    q.setParameter("actor", actor);
    q.setParameter("landlord", landlord);
    return ((List<PropertyRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }

  private Property model(PropertyRecord e) {
    var v = new Property();
    v.id = e.id;
    v.ownerUserId = e.ownerUserId;
    v.name = e.name;
    v.address = e.address;
    v.status = e.status;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }
}
