package com.smartrent.notification.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.notification.application.NotificationService;
import com.smartrent.notification.domain.Notification;
import com.smartrent.shared.api.*;
import java.time.Instant;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/notifications")
public class NotificationController {
  private final NotificationService service;

  public NotificationController(NotificationService s) {
    service = s;
  }

  public record Patch(Boolean read) {}

  public record View(
      UUID id,
      String type,
      String message,
      Instant readAt,
      Instant createdAt,
      Map<String, Object> source) {}

  private View view(Notification n) {
    return new View(
        n.id(),
        n.type(),
        n.message(),
        n.readAt(),
        n.createdAt(),
        Map.of("type", n.sourceType(), "id", n.sourceId()));
  }

  @GetMapping
  Object list(
      @RequestParam(required = false) Boolean unread,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = service.list(Actor.current(), unread, page, size);
    return new PageResponse<>(p.items().stream().map(this::view).toList(), page, size);
  }

  @GetMapping("/{id}")
  Object get(@PathVariable UUID id) {
    return view(service.get(Actor.current(), id));
  }

  @PatchMapping("/{id}")
  Object read(@PathVariable UUID id, @RequestBody Patch b) {
    if (!Boolean.TRUE.equals(b.read())) throw ApiFailure.invalid();
    return view(service.read(Actor.current(), id));
  }
}
