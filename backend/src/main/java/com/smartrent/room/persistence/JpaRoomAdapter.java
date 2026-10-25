package com.smartrent.room.persistence;

import com.smartrent.room.domain.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaRoomAdapter implements RoomRepository {
  @PersistenceContext EntityManager em;

  public Room find(UUID id, boolean lock) {
    var e = em.find(RoomRecord.class, id);
    if (e == null) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public Room save(Room v) {
    var e = v.id == null ? null : em.find(RoomRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new RoomRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.propertyId = v.propertyId;
    e.roomCode = v.roomCode;
    e.status = v.status;
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  public List<Room> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit) {
    var q =
        em.createNativeQuery(
            "SELECT x.* FROM rooms x WHERE (:landlord AND EXISTS(SELECT 1 FROM properties p WHERE"
                + " p.id=x.property_id AND p.owner_user_id=:actor)) AND x.property_id=:filter ORDER"
                + " BY x.created_at,x.id",
            RoomRecord.class);
    q.setParameter("actor", actor);
    q.setParameter("landlord", landlord);
    q.setParameter("filter", filter);
    return ((List<RoomRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }

  private Room model(RoomRecord e) {
    var v = new Room();
    v.id = e.id;
    v.propertyId = e.propertyId;
    v.roomCode = e.roomCode;
    v.status = e.status;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }
}
