package com.smartrent.contract.application;

import com.smartrent.contract.domain.*;
import java.time.*;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class ContractQueries {
  private final ContractRepository repo;
  private final Clock clock;

  public ContractQueries(ContractRepository repo, Clock clock) {
    this.repo = repo;
    this.clock = clock;
  }

  @Transactional(readOnly = true)
  public boolean occupied(UUID room) {
    return repo.effective(room, null, LocalDate.now(clock));
  }

  @Transactional(readOnly = true)
  public boolean entitled(UUID room, UUID user) {
    return repo.effective(room, user, LocalDate.now(clock));
  }

  @Transactional(readOnly = true)
  public boolean reserved(UUID room) {
    return repo.reserved(room, LocalDate.now(clock));
  }

  @Transactional(readOnly = true)
  public java.util.Set<UUID> occupiedRooms(java.util.Collection<UUID> rooms) {
    return repo.occupiedRooms(rooms, LocalDate.now(clock));
  }

  public String status(Contract c) {
    return c.status.equals("ACTIVE") && c.endDate.isBefore(LocalDate.now(clock))
        ? "EXPIRED"
        : c.status;
  }
}
