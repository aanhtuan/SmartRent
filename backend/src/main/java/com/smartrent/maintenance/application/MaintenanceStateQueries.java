package com.smartrent.maintenance.application;

import com.smartrent.maintenance.domain.MaintenanceRepository;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class MaintenanceStateQueries {
  private final MaintenanceRepository repo;

  public MaintenanceStateQueries(MaintenanceRepository r) {
    repo = r;
  }

  @Transactional(readOnly = true)
  public boolean open(UUID room) {
    return repo.open(room);
  }
}
