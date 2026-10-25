package com.smartrent.contract.application;

import com.smartrent.contract.domain.*;
import com.smartrent.identity.application.Actor;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.*;
import com.smartrent.tenant.application.TenantAccess;
import java.time.*;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class ContractService {
  private final ContractRepository repo;
  private final ContractAccess access;
  private final ContractQueries queries;
  private final RoomAccess rooms;
  private final TenantAccess tenants;
  private final ContractBillingGuard billing;
  private final Clock clock;
  private final ApplicationEventPublisher events;

  public ContractService(
      ContractRepository r,
      ContractAccess a,
      ContractQueries q,
      RoomAccess rooms,
      TenantAccess t,
      ContractBillingGuard b,
      Clock c,
      ApplicationEventPublisher e) {
    repo = r;
    access = a;
    queries = q;
    this.rooms = rooms;
    tenants = t;
    billing = b;
    clock = c;
    events = e;
  }

  @Transactional(readOnly = true)
  public PageResponse<Contract> list(Actor a, UUID room, String status, int page, int size) {
    if (room != null) {
      if (a.landlord()) rooms.owned(room, a);
      else if (!repo.historicalRoom(room, a.id())) throw ApiFailure.missing();
    }
    if (status != null) Inputs.choice(status, "ACTIVE", "TERMINATED", "EXPIRED");
    return new PageResponse<>(
        repo.visible(a.id(), a.landlord(), room, status, PageResponse.offset(page, size), size),
        page,
        size);
  }

  private void dates(LocalDate start, LocalDate end) {
    if (start == null || end == null || end.isBefore(start)) throw ApiFailure.invalid();
  }

  @Transactional
  public Contract create(
      Actor a, UUID tenant, UUID room, LocalDate start, LocalDate end, String status) {
    a.requireLandlord();
    dates(start, end);
    if (status != null && !status.equals("ACTIVE")) throw ApiFailure.invalid();
    if (tenant == null || room == null) throw ApiFailure.invalid();
    rooms.lock(room, a);
    if (!rooms.active(room)) throw ApiFailure.state();
    tenants.managed(tenant, a);
    if (repo.overlaps(room, null, start, end)) throw ApiFailure.conflict();
    var c = new Contract();
    c.tenantProfileId = tenant;
    c.roomId = room;
    c.startDate = start;
    c.endDate = end;
    c.status = "ACTIVE";
    c = repo.save(c);
    events.publishEvent(
        new BusinessNotice(tenants.user(tenant), "CONTRACT_EVENT", "contract", c.id));
    return c;
  }

  @Transactional
  public Contract update(Actor a, UUID id, LocalDate start, LocalDate end, String status) {
    var c = access.lockOwned(id, a);
    if (!queries.status(c).equals("ACTIVE")) throw ApiFailure.state();
    if (start == null && end == null && status == null) throw ApiFailure.invalid();
    if (status != null) Inputs.choice(status, "ACTIVE", "TERMINATED");
    var today = LocalDate.now(clock);
    boolean terminate = "TERMINATED".equals(status);
    if (terminate) {
      if (start != null) throw ApiFailure.invalid();
      if (!c.startDate.isAfter(today)) {
        var chosen = end == null ? today : end;
        if (chosen.isBefore(c.startDate) || chosen.isAfter(today) || chosen.isAfter(c.endDate))
          throw ApiFailure.state();
        c.endDate = chosen;
      } else if (end != null && !end.equals(c.endDate)) throw ApiFailure.state();
      c.status = "TERMINATED";
    } else {
      if (start != null) c.startDate = start;
      if (end != null) c.endDate = end;
      dates(c.startDate, c.endDate);
      billing.ensureDates(c.id, c.startDate, c.endDate);
      if (repo.overlaps(c.roomId, c.id, c.startDate, c.endDate)) throw ApiFailure.conflict();
    }
    c = repo.save(c);
    events.publishEvent(
        new BusinessNotice(tenants.user(c.tenantProfileId), "CONTRACT_EVENT", "contract", c.id));
    return c;
  }
}
