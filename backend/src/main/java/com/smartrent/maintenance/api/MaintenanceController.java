package com.smartrent.maintenance.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.maintenance.application.*;
import com.smartrent.maintenance.domain.Maintenance;
import com.smartrent.maintenance.domain.MaintenanceWorkLog;
import com.smartrent.shared.api.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/maintenance-requests")
public class MaintenanceController {
  private final MaintenanceService service;
  private final MaintenanceQueries queries;
  private final MaintenanceWorkLogService workLogs;
  private final MaintenanceAiService ai;

  public MaintenanceController(
      MaintenanceService s,
      MaintenanceQueries q,
      MaintenanceWorkLogService workLogs,
      MaintenanceAiService a) {
    service = s;
    queries = q;
    this.workLogs = workLogs;
    ai = a;
  }

  public record Create(
      UUID roomId, String originalDescription, UUID submissionKey, String previewToken) {}

  public record Preview(UUID roomId, String originalDescription) {}

  public record Status(String status, String cancellationReason) {}

  public record Classify(String additionalInformation) {}

  public record WorkLogCreate(String performedBy, String workDescription) {}

  public record WorkLogView(
      UUID id, String performedBy, String workDescription, Instant createdAt) {}

  public record View(
      UUID id,
      UUID roomId,
      String originalDescription,
      String category,
      String priority,
      String aiSummary,
      BigDecimal aiConfidence,
      List<String> aiMissingInformation,
      String aiClassificationStatus,
      String status,
      String cancellationReason,
      Instant createdAt,
      Instant updatedAt) {}

  private View view(Maintenance m) {
    return new View(
        m.id,
        m.roomId,
        m.originalDescription,
        m.category,
        m.priority,
        m.aiSummary,
        m.aiConfidence,
        List.of(m.aiMissingInformation),
        m.aiClassificationStatus,
        m.status,
        m.cancellationReason,
        m.createdAt,
        m.updatedAt);
  }

  private WorkLogView workLogView(MaintenanceWorkLog workLog) {
    return new WorkLogView(
        workLog.id(), workLog.performedBy(), workLog.workDescription(), workLog.createdAt());
  }

  @GetMapping
  Object list(
      @RequestParam(name = "room_id", required = false) UUID room,
      @RequestParam(required = false) String status,
      @RequestParam(required = false) String priority,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = queries.list(Actor.current(), room, status, page, size, priority);
    return new PageResponse<>(p.items().stream().map(this::view).toList(), page, size);
  }

  @PostMapping
  ResponseEntity<?> submit(@RequestBody Create b) {
    var r =
        service.submit(
            Actor.current(),
            b.roomId(),
            b.originalDescription(),
            b.submissionKey(),
            b.previewToken());
    return ResponseEntity.status(r.created() ? 201 : 200).body(view(r.value()));
  }

  @PostMapping("/preview")
  Object preview(@RequestBody Preview b) {
    return ai.preview(Actor.current(), b.roomId(), b.originalDescription());
  }

  @GetMapping("/{id}")
  Object get(@PathVariable UUID id) {
    return view(queries.visible(id, Actor.current()));
  }

  @GetMapping("/{id}/work-logs")
  Object workLogs(
      @PathVariable UUID id,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var result = workLogs.list(Actor.current(), id, page, size);
    return new PageResponse<>(
        result.items().stream().map(this::workLogView).toList(), result.page(), result.pageSize());
  }

  @PostMapping("/{id}/work-logs")
  ResponseEntity<WorkLogView> addWorkLog(@PathVariable UUID id, @RequestBody WorkLogCreate body) {
    var result = workLogs.add(Actor.current(), id, body.performedBy(), body.workDescription());
    return ResponseEntity.status(201).body(workLogView(result));
  }

  @PatchMapping("/{id}/status")
  Object status(@PathVariable UUID id, @RequestBody Status b) {
    return view(service.status(Actor.current(), id, b.status(), b.cancellationReason()));
  }

  @PostMapping("/{id}/classify")
  Object classify(@PathVariable UUID id, @RequestBody Classify b) {
    return view(ai.classify(Actor.current(), id, b.additionalInformation()));
  }
}
