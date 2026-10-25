package com.smartrent.property.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.property.application.*;
import com.smartrent.property.domain.Property;
import com.smartrent.shared.api.PageResponse;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/properties")
public class PropertyController {
  private final PropertyService service;
  private final PropertyAccess access;

  public PropertyController(PropertyService s, PropertyAccess a) {
    service = s;
    access = a;
  }

  public record Body(String name, String address, String status) {}

  public record View(
      UUID id,
      String name,
      String address,
      String status,
      java.time.Instant createdAt,
      java.time.Instant updatedAt) {}

  private View view(Property p) {
    return new View(p.id, p.name, p.address, p.status, p.createdAt, p.updatedAt);
  }

  @GetMapping
  Object list(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = service.list(Actor.current(), page, size);
    return new PageResponse<>(p.items().stream().map(this::view).toList(), page, size);
  }

  @PostMapping
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  Object create(@RequestBody Body b) {
    return view(service.create(Actor.current(), b.name(), b.address(), b.status()));
  }

  @GetMapping("/{id}")
  Object get(@PathVariable UUID id) {
    return view(access.owned(id, Actor.current()));
  }

  @PatchMapping("/{id}")
  Object update(@PathVariable UUID id, @RequestBody Body b) {
    return view(service.update(Actor.current(), id, b.name(), b.address(), b.status()));
  }
}
