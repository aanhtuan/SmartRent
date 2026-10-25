package com.smartrent.contract.persistence;

import com.smartrent.contract.domain.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaContractAdapter implements ContractRepository {
  @PersistenceContext EntityManager em;
  @org.springframework.beans.factory.annotation.Autowired java.time.Clock clock;

  public Contract find(UUID id, boolean lock) {
    var e = em.find(ContractRecord.class, id);
    if (e == null) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public Contract save(Contract v) {
    var e = v.id == null ? null : em.find(ContractRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new ContractRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.tenantProfileId = v.tenantProfileId;
    e.roomId = v.roomId;
    e.startDate = v.startDate;
    e.endDate = v.endDate;
    e.status = v.status;
    e.tenantSignature = v.tenantSignature;
    e.tenantSignedAt = v.tenantSignedAt;
    e.landlordSignature = v.landlordSignature;
    e.landlordSignedAt = v.landlordSignedAt;
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  public List<Contract> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit) {
    var q =
        em.createNativeQuery(
            "SELECT x.* FROM contracts x WHERE ((:landlord AND EXISTS(SELECT 1 FROM rooms r JOIN"
                + " properties p ON p.id=r.property_id WHERE r.id=x.room_id AND"
                + " p.owner_user_id=:actor)) OR (NOT :landlord AND EXISTS(SELECT 1 FROM"
                + " tenant_profiles t WHERE t.id=x.tenant_profile_id AND t.user_id=:actor))) AND"
                + " (CAST(:filter AS uuid) IS NULL OR x.room_id=CAST(:filter AS uuid)) AND"
                + " (CAST(:status AS text) IS NULL OR (CASE WHEN x.status='ACTIVE' AND x.end_date <"
                + " :today THEN 'EXPIRED' ELSE x.status END)=CAST(:status AS text)) ORDER BY"
                + " x.created_at,x.id",
            ContractRecord.class);
    q.setParameter("today", java.time.LocalDate.now(clock));
    q.setParameter("actor", actor);
    q.setParameter("landlord", landlord);
    q.setParameter("filter", filter);
    q.setParameter("status", status);
    return ((List<ContractRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }

  private Contract model(ContractRecord e) {
    var v = new Contract();
    v.id = e.id;
    v.tenantProfileId = e.tenantProfileId;
    v.roomId = e.roomId;
    v.startDate = e.startDate;
    v.endDate = e.endDate;
    v.status = e.status;
    v.tenantSignature = e.tenantSignature;
    v.tenantSignedAt = e.tenantSignedAt;
    v.landlordSignature = e.landlordSignature;
    v.landlordSignedAt = e.landlordSignedAt;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }

  public java.util.Set<UUID> occupiedRooms(
      java.util.Collection<UUID> rooms, java.time.LocalDate today) {
    if (rooms.isEmpty()) return java.util.Set.of();
    return new java.util.HashSet<>(
        em.createQuery(
                "SELECT DISTINCT c.roomId FROM ContractRecord c WHERE c.roomId IN :rooms AND"
                    + " c.status='ACTIVE' AND c.startDate<=:today AND c.endDate>=:today",
                UUID.class)
            .setParameter("rooms", rooms)
            .setParameter("today", today)
            .getResultList());
  }

  public boolean historicalRoom(UUID room, UUID user) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM contracts c JOIN tenant_profiles t ON"
                            + " t.id=c.tenant_profile_id WHERE c.room_id=:room AND t.user_id=:user")
                    .setParameter("room", room)
                    .setParameter("user", user)
                    .getSingleResult())
            .longValue()
        > 0;
  }

  public boolean overlaps(
      UUID room, UUID except, java.time.LocalDate start, java.time.LocalDate end) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM contracts WHERE room_id=:room AND status='ACTIVE' AND"
                            + " (CAST(:except AS uuid) IS NULL OR id<>CAST(:except AS uuid)) AND"
                            + " start_date<=:end AND end_date>=:start")
                    .setParameter("room", room)
                    .setParameter("except", except)
                    .setParameter("start", start)
                    .setParameter("end", end)
                    .getSingleResult())
            .longValue()
        > 0;
  }

  public boolean effective(UUID room, UUID user, java.time.LocalDate today) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM contracts c JOIN tenant_profiles t ON"
                            + " t.id=c.tenant_profile_id WHERE c.room_id=:room AND"
                            + " c.status='ACTIVE' AND c.start_date<=:today AND c.end_date>=:today"
                            + " AND (CAST(:user AS uuid) IS NULL OR t.user_id=CAST(:user AS uuid))")
                    .setParameter("room", room)
                    .setParameter("user", user)
                    .setParameter("today", today)
                    .getSingleResult())
            .longValue()
        > 0;
  }

  public boolean reserved(UUID room, java.time.LocalDate today) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM contracts WHERE room_id=:room AND status='ACTIVE' AND"
                            + " end_date>=:today")
                    .setParameter("room", room)
                    .setParameter("today", today)
                    .getSingleResult())
            .longValue()
        > 0;
  }
}
