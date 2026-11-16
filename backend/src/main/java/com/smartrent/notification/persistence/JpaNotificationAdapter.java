package com.smartrent.notification.persistence;

import com.smartrent.notification.domain.*;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaNotificationAdapter implements NotificationRepository {
  @PersistenceContext EntityManager em;

  private Notification model(NotificationRecord n) {
    return new Notification(
        n.id,
        n.recipientUserId,
        n.type,
        n.message,
        n.readAt,
        n.createdAt,
        n.maintenanceRequestId != null
            ? "maintenance_request"
            : n.paymentId != null ? "payment" : "contract",
        n.maintenanceRequestId != null
            ? n.maintenanceRequestId
            : n.paymentId != null ? n.paymentId : n.contractId);
  }

  public void create(Notification n) {
    var e = new NotificationRecord();
    e.id = n.id();
    e.recipientUserId = n.recipientUserId();
    e.type = n.type();
    e.message = n.message();
    e.createdAt = n.createdAt();
    switch (n.sourceType()) {
      case "maintenance_request" -> e.maintenanceRequestId = n.sourceId();
      case "payment" -> e.paymentId = n.sourceId();
      case "contract" -> e.contractId = n.sourceId();
      default -> throw new IllegalArgumentException("Unknown source type");
    }
    em.persist(e);
    em.flush();
  }

  public Notification find(UUID id, UUID recipient, boolean lock) {
    var e = em.find(NotificationRecord.class, id);
    if (e == null || !e.recipientUserId.equals(recipient)) return null;
    if (lock) em.refresh(e, LockModeType.PESSIMISTIC_WRITE);
    return model(e);
  }

  public List<Notification> list(UUID recipient, Boolean unread, int offset, int limit) {
    var q =
        em.createQuery(
                "SELECT n FROM NotificationRecord n WHERE n.recipientUserId=:recipient"
                    + (unread == null
                        ? ""
                        : unread ? " AND n.readAt IS NULL" : " AND n.readAt IS NOT NULL")
                    + " ORDER BY n.createdAt DESC,n.id",
                NotificationRecord.class)
            .setParameter("recipient", recipient);
    return q.setFirstResult(offset).setMaxResults(limit).getResultList().stream()
        .map(this::model)
        .toList();
  }

  public Notification markRead(UUID id, UUID recipient) {
    var found = find(id, recipient, true);
    if (found == null) return null;
    var e = em.find(NotificationRecord.class, id);
    if (e.readAt == null) e.readAt = Instant.now();
    em.flush();
    return model(e);
  }
}
