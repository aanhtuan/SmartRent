package com.smartrent.contract.domain;

import java.util.*;

public interface ContractRepository {
  Contract find(UUID id, boolean lock);

  Contract save(Contract value);

  java.util.Set<UUID> occupiedRooms(java.util.Collection<UUID> rooms, java.time.LocalDate today);

  boolean historicalRoom(UUID room, UUID user);

  boolean overlaps(UUID room, UUID except, java.time.LocalDate start, java.time.LocalDate end);

  boolean effective(UUID room, UUID user, java.time.LocalDate today);

  boolean reserved(UUID room, java.time.LocalDate today);

  List<Contract> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit);
}
