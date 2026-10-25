package com.smartrent.maintenance.domain;

import java.util.*;

public interface MaintenanceRepository {
  Maintenance find(UUID id, boolean lock);

  Maintenance save(Maintenance value);

  void lockSubmissions(UUID creator);

  Maintenance submission(UUID tenant, UUID key);

  boolean canFilterRoom(UUID room, UUID user);

  boolean open(UUID room);

  List<Maintenance> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit);

  List<Maintenance> filtered(
      UUID actor,
      boolean landlord,
      UUID room,
      String status,
      String priority,
      int offset,
      int limit);
}
