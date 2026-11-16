package com.smartrent.tenant.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.shared.api.PageResponse;
import com.smartrent.tenant.application.*;
import com.smartrent.tenant.domain.Tenant;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/tenant-profiles")
public class TenantController {
  private final TenantService service;
  private final TenantAccess access;

  public TenantController(TenantService s, TenantAccess a) {
    service = s;
    access = a;
  }

  public record Create(UUID userId, String fullName, String phoneNumber) {}

  public record Patch(String fullName, String phoneNumber) {}

  public record View(UUID id, UUID userId, String fullName, String phoneNumber) {}

  private View view(Tenant t) {
    return new View(t.id, t.userId, t.fullName, t.phoneNumber);
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
  Object create(@RequestBody Create b) {
    return view(service.create(Actor.current(), b.userId(), b.fullName(), b.phoneNumber()));
  }

  @GetMapping("/{id}")
  Object get(@PathVariable UUID id) {
    return view(access.visible(id, Actor.current()));
  }

  @PatchMapping("/{id}")
  Object patch(@PathVariable UUID id, @RequestBody com.fasterxml.jackson.databind.JsonNode b) {
    if (!b.isObject()) throw com.smartrent.shared.api.ApiFailure.invalid();
    if (b.has("user_id") || b.has("manager_landlord_id"))
      throw new com.smartrent.shared.api.ApiFailure(
          403, "FORBIDDEN", "Identity and ownership are immutable.");
    var fields = b.fieldNames();
    while (fields.hasNext())
      if (!Set.of("full_name", "phone_number").contains(fields.next()))
        throw com.smartrent.shared.api.ApiFailure.invalid();
    if (b.has("full_name") && !b.get("full_name").isTextual()
        || b.hasNonNull("phone_number") && !b.get("phone_number").isTextual())
      throw com.smartrent.shared.api.ApiFailure.invalid();
    return view(
        service.update(
            Actor.current(),
            id,
            b.has("full_name") ? b.get("full_name").textValue() : null,
            b.hasNonNull("phone_number") ? b.get("phone_number").textValue() : null,
            b.has("phone_number")));
  }
}
