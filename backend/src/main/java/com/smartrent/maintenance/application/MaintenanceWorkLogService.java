package com.smartrent.maintenance.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.maintenance.domain.MaintenanceWorkLog;
import com.smartrent.maintenance.domain.MaintenanceWorkLogRepository;
import com.smartrent.shared.api.PageResponse;
import com.smartrent.shared.application.Inputs;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class MaintenanceWorkLogService {
  private final MaintenanceWorkLogRepository repository;
  private final MaintenanceQueries maintenance;

  public MaintenanceWorkLogService(
      MaintenanceWorkLogRepository repository, MaintenanceQueries maintenance) {
    this.repository = repository;
    this.maintenance = maintenance;
  }

  @Transactional(readOnly = true)
  public PageResponse<MaintenanceWorkLog> list(
      Actor actor, UUID maintenanceRequestId, int page, int pageSize) {
    int offset = PageResponse.offset(page, pageSize);
    maintenance.visible(maintenanceRequestId, actor);
    return new PageResponse<>(
        repository.forRequest(maintenanceRequestId, offset, pageSize), page, pageSize);
  }

  @Transactional
  public MaintenanceWorkLog add(
      Actor actor, UUID maintenanceRequestId, String performedBy, String workDescription) {
    actor.requireLandlord();
    maintenance.visible(maintenanceRequestId, actor);
    Inputs.text(performedBy, 200);
    Inputs.text(workDescription, 2000);
    return repository.save(
        new MaintenanceWorkLog(
            null, maintenanceRequestId, actor.id(), performedBy, workDescription, null));
  }
}
