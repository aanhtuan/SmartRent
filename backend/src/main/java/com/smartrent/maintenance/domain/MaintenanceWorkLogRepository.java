package com.smartrent.maintenance.domain;

import java.util.List;
import java.util.UUID;

public interface MaintenanceWorkLogRepository {
  MaintenanceWorkLog save(MaintenanceWorkLog value);

  List<MaintenanceWorkLog> forRequest(UUID maintenanceRequestId, int offset, int limit);
}
