package com.smartrent.maintenance.persistence;

import com.smartrent.maintenance.domain.*;
import jakarta.persistence.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaMaintenanceAdapter implements MaintenanceRepository {
  @PersistenceContext EntityManager em;

  public Maintenance find(UUID id, boolean lock) {
    var e = em.find(MaintenanceRecord.class, id);
    if (e == null) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public Maintenance save(Maintenance v) {
    var e = v.id == null ? null : em.find(MaintenanceRecord.class, v.id);
    boolean fresh = e == null;
    if (fresh) {
      e = new MaintenanceRecord();
      e.id = v.id == null ? UUID.randomUUID() : v.id;
    }
    e.tenantProfileId = v.tenantProfileId;
    e.roomId = v.roomId;
    e.originalDescription = v.originalDescription;
    e.submissionKey = v.submissionKey;
    e.submissionDigest = v.submissionDigest;
    e.category = v.category;
    e.priority = v.priority;
    e.aiSummary = v.aiSummary;
    e.aiConfidence = v.aiConfidence;
    e.aiMissingInformation = v.aiMissingInformation;
    e.aiClassificationStatus = v.aiClassificationStatus;
    e.status = v.status;
    e.updatedByUserId = v.updatedByUserId;
    e.cancellationReason = v.cancellationReason;
    if (fresh) em.persist(e);
    em.flush();
    return model(e);
  }

  public List<Maintenance> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit) {
    var q =
        em.createNativeQuery(
            "SELECT x.* FROM maintenance_requests x WHERE ((:landlord AND EXISTS(SELECT 1 FROM"
                + " rooms r JOIN properties p ON p.id=r.property_id WHERE r.id=x.room_id AND"
                + " p.owner_user_id=:actor)) OR (NOT :landlord AND EXISTS(SELECT 1 FROM"
                + " tenant_profiles t WHERE t.id=x.tenant_profile_id AND t.user_id=:actor))) AND"
                + " (CAST(:filter AS uuid) IS NULL OR x.room_id=CAST(:filter AS uuid)) AND"
                + " (CAST(:status AS text) IS NULL OR x.status=CAST(:status AS text)) ORDER BY"
                + " x.created_at,x.id",
            MaintenanceRecord.class);
    q.setParameter("actor", actor);
    q.setParameter("landlord", landlord);
    q.setParameter("filter", filter);
    q.setParameter("status", status);
    return ((List<MaintenanceRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }

  private Maintenance model(MaintenanceRecord e) {
    var v = new Maintenance();
    v.id = e.id;
    v.tenantProfileId = e.tenantProfileId;
    v.roomId = e.roomId;
    v.originalDescription = e.originalDescription;
    v.submissionKey = e.submissionKey;
    v.submissionDigest = e.submissionDigest;
    v.category = e.category;
    v.priority = e.priority;
    v.aiSummary = e.aiSummary;
    v.aiConfidence = e.aiConfidence;
    v.aiMissingInformation = e.aiMissingInformation;
    v.aiClassificationStatus = e.aiClassificationStatus;
    v.status = e.status;
    v.updatedByUserId = e.updatedByUserId;
    v.cancellationReason = e.cancellationReason;
    v.createdAt = e.createdAt;
    v.updatedAt = e.updatedAt;
    return v;
  }

  public void lockSubmissions(UUID creator) {
    em.createNativeQuery(
            "SELECT 1 FROM pg_advisory_xact_lock(hashtextextended(CAST(:creator AS text),42))")
        .setParameter("creator", creator.toString())
        .getSingleResult();
  }

  public Maintenance submission(UUID tenant, UUID key) {
    var rows =
        em.createQuery(
                "SELECT m FROM MaintenanceRecord m WHERE m.tenantProfileId=:tenant AND"
                    + " m.submissionKey=:key",
                MaintenanceRecord.class)
            .setParameter("tenant", tenant)
            .setParameter("key", key)
            .getResultList();
    return rows.isEmpty() ? null : model(rows.get(0));
  }

  public boolean canFilterRoom(UUID room, UUID user) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM maintenance_requests m JOIN tenant_profiles t ON"
                            + " t.id=m.tenant_profile_id WHERE m.room_id=:room AND t.user_id=:user")
                    .setParameter("room", room)
                    .setParameter("user", user)
                    .getSingleResult())
            .longValue()
        > 0;
  }

  public boolean open(UUID room) {
    return ((Number)
                em.createNativeQuery(
                        "SELECT count(*) FROM maintenance_requests WHERE room_id=:room AND status"
                            + " IN ('PENDING','PROCESSING')")
                    .setParameter("room", room)
                    .getSingleResult())
            .longValue()
        > 0;
  }

  public List<Maintenance> filtered(
      UUID actor,
      boolean landlord,
      UUID room,
      String status,
      String priority,
      int offset,
      int limit) {
    var q =
        em.createNativeQuery(
                "SELECT x.* FROM maintenance_requests x WHERE ((:landlord AND EXISTS(SELECT 1 FROM"
                    + " rooms r JOIN properties p ON p.id=r.property_id WHERE r.id=x.room_id AND"
                    + " p.owner_user_id=:actor)) OR (NOT :landlord AND EXISTS(SELECT 1 FROM"
                    + " tenant_profiles t WHERE t.id=x.tenant_profile_id AND t.user_id=:actor)))"
                    + " AND (CAST(:room AS uuid) IS NULL OR x.room_id=CAST(:room AS uuid)) AND"
                    + " (CAST(:status AS text) IS NULL OR x.status=CAST(:status AS text)) AND"
                    + " (CAST(:priority AS text) IS NULL OR x.priority=CAST(:priority AS text))"
                    + " ORDER BY x.created_at,x.id",
                MaintenanceRecord.class)
            .setParameter("actor", actor)
            .setParameter("landlord", landlord)
            .setParameter("room", room)
            .setParameter("status", status)
            .setParameter("priority", priority);
    return ((List<MaintenanceRecord>) q.setFirstResult(offset).setMaxResults(limit).getResultList())
        .stream().map(this::model).toList();
  }
}
