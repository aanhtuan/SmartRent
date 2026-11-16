package com.smartrent.maintenance.persistence;

import com.smartrent.maintenance.domain.MaintenanceWorkLog;
import com.smartrent.maintenance.domain.MaintenanceWorkLogRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.List;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaMaintenanceWorkLogAdapter implements MaintenanceWorkLogRepository {
  @PersistenceContext EntityManager em;

  @Override
  public MaintenanceWorkLog save(MaintenanceWorkLog value) {
    var record = new MaintenanceWorkLogRecord();
    record.maintenanceRequestId = value.maintenanceRequestId();
    record.recordedByUserId = value.recordedByUserId();
    record.performedBy = value.performedBy();
    record.workDescription = value.workDescription();
    em.persist(record);
    em.flush();
    return model(record);
  }

  @Override
  public List<MaintenanceWorkLog> forRequest(
      UUID maintenanceRequestId, int offset, int limit) {
    return em.createQuery(
            "SELECT w FROM MaintenanceWorkLogRecord w WHERE"
                + " w.maintenanceRequestId=:maintenanceRequestId"
                + " ORDER BY w.createdAt DESC,w.id DESC",
            MaintenanceWorkLogRecord.class)
        .setParameter("maintenanceRequestId", maintenanceRequestId)
        .setFirstResult(offset)
        .setMaxResults(limit)
        .getResultList()
        .stream()
        .map(this::model)
        .toList();
  }

  private MaintenanceWorkLog model(MaintenanceWorkLogRecord record) {
    return new MaintenanceWorkLog(
        record.id,
        record.maintenanceRequestId,
        record.recordedByUserId,
        record.performedBy,
        record.workDescription,
        record.createdAt);
  }
}
