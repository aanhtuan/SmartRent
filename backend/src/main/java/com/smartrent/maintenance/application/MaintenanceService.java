package com.smartrent.maintenance.application;

import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.contract.application.ContractQueries;
import com.smartrent.identity.application.Actor;
import com.smartrent.maintenance.domain.*;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.*;
import com.smartrent.tenant.application.TenantAccess;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class MaintenanceService {
  private final MaintenanceRepository repo;
  private final MaintenanceQueries queries;
  private final RoomAccess rooms;
  private final TenantAccess tenants;
  private final ContractQueries contracts;
  private final SubmissionDigest digests;
  private final PreviewTokens tokens;
  private final ApplicationEventPublisher events;

  public MaintenanceService(
      MaintenanceRepository r,
      MaintenanceQueries q,
      RoomAccess rooms,
      TenantAccess t,
      ContractQueries c,
      SubmissionDigest d,
      PreviewTokens p,
      ApplicationEventPublisher e) {
    repo = r;
    queries = q;
    this.rooms = rooms;
    tenants = t;
    contracts = c;
    digests = d;
    tokens = p;
    events = e;
  }

  @Transactional(readOnly = true)
  public void eligible(Actor a, UUID room) {
    if (a.landlord()) throw new ApiFailure(403, "FORBIDDEN", "Tenant access required.");
    if (room == null) throw ApiFailure.invalid();
    if (!rooms.active(room) || !contracts.entitled(room, a.id())) throw ApiFailure.state();
  }

  public record Submission(Maintenance value, boolean created) {}

  private void metadata(Maintenance m, String state, Classification c) {
    m.aiClassificationStatus = state;
    m.category = c == null ? null : c.category();
    m.priority = c == null ? null : c.priority();
    m.aiSummary = c == null ? null : c.summary();
    m.aiConfidence = c == null ? null : BigDecimal.valueOf(c.confidence());
    m.aiMissingInformation =
        c == null ? new String[0] : c.missingInformation().toArray(String[]::new);
  }

  @Transactional
  public Submission submit(Actor a, UUID room, String description, UUID key, String token) {
    if (a.landlord()) throw new ApiFailure(403, "FORBIDDEN", "Tenant access required.");
    Inputs.text(description, 5000);
    if (room == null || key == null) throw ApiFailure.invalid();
    var tenant = tenants.own(a);
    // Serialize retries by creator, then lock property/room in the common order.
    repoLock(tenant.id);
    String digest = digests.digest(room, description);
    var existing = repo.submission(tenant.id, key);
    if (existing != null) {
      if (!existing.submissionDigest.equals(digest)) throw ApiFailure.conflict();
      return new Submission(existing, false);
    }
    rooms.lockForTenancy(room);
    eligible(a, room);
    String state = "NOT_REQUESTED";
    Classification classification = null;
    if (token != null) {
      var p = tokens.decode(token, a.id(), room, digest);
      state = p.state();
      classification = p.classification();
    }
    var m = new Maintenance();
    m.tenantProfileId = tenant.id;
    m.roomId = room;
    m.originalDescription = description;
    m.submissionKey = key;
    m.submissionDigest = digest;
    m.status = "PENDING";
    m.updatedByUserId = a.id();
    metadata(m, state, classification);
    m = repo.save(m);
    events.publishEvent(
        new BusinessNotice(rooms.owner(room), "MAINTENANCE_CREATED", "maintenance_request", m.id));
    return new Submission(m, true);
  }

  private void repoLock(UUID creator) {
    repo.lockSubmissions(creator);
  }

  @Transactional
  public Maintenance status(Actor a, UUID id, String next, String reason) {
    a.requireLandlord();
    var old = queries.visible(id, a);
    rooms.lock(old.roomId, a);
    var m = repo.find(id, true);
    Inputs.choice(next, "PROCESSING", "COMPLETED", "CANCELLED");
    boolean allowed =
        m.status.equals("PENDING") && next.equals("PROCESSING")
            || m.status.equals("PROCESSING")
                && (next.equals("COMPLETED") || next.equals("CANCELLED"));
    if (!allowed) throw ApiFailure.state();
    if (next.equals("CANCELLED")) Inputs.text(reason, 500);
    else if (reason != null) throw ApiFailure.invalid();
    m.status = next;
    m.cancellationReason = reason;
    m.updatedByUserId = a.id();
    m = repo.save(m);
    events.publishEvent(
        new BusinessNotice(
            tenants.user(m.tenantProfileId), "MAINTENANCE_UPDATED", "maintenance_request", m.id));
    return m;
  }

  @Transactional
  public Maintenance classification(Actor a, UUID id, Instant version, Classification result) {
    var old = queries.visible(id, a);
    rooms.lockForTenancy(old.roomId);
    var m = repo.find(id, true);
    if (!m.updatedAt.equals(version)) throw ApiFailure.conflict();
    metadata(m, result.missingInformation().isEmpty() ? "CLASSIFIED" : "NEEDS_INFORMATION", result);
    m.updatedByUserId = a.id();
    return repo.save(m);
  }
}
