package com.smartrent.contract.api;

import com.smartrent.contract.application.*;
import com.smartrent.contract.domain.Contract;
import com.smartrent.identity.application.Actor;
import com.smartrent.shared.api.PageResponse;
import java.time.LocalDate;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/contracts")
public class ContractController {
  private final ContractService service;
  private final ContractAccess access;
  private final ContractQueries queries;

  public ContractController(ContractService s, ContractAccess a, ContractQueries q) {
    service = s;
    access = a;
    queries = q;
  }

  public record Create(
      UUID tenantProfileId, UUID roomId, LocalDate startDate, LocalDate endDate, String status) {}

  public record Patch(LocalDate startDate, LocalDate endDate, String status) {}

  public record View(
      UUID id,
      UUID tenantProfileId,
      UUID roomId,
      LocalDate startDate,
      LocalDate endDate,
      String status) {}

  private View view(Contract c) {
    return new View(c.id, c.tenantProfileId, c.roomId, c.startDate, c.endDate, queries.status(c));
  }

  @GetMapping
  Object list(
      @RequestParam(name = "room_id", required = false) UUID room,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = service.list(Actor.current(), room, status, page, size);
    return new PageResponse<>(p.items().stream().map(this::view).toList(), page, size);
  }

  @PostMapping
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  Object create(@RequestBody Create b) {
    return view(
        service.create(
            Actor.current(),
            b.tenantProfileId(),
            b.roomId(),
            b.startDate(),
            b.endDate(),
            b.status()));
  }

  @GetMapping("/{id}")
  Object get(@PathVariable UUID id) {
    return view(access.visible(id, Actor.current()));
  }

  @PatchMapping("/{id}")
  Object patch(@PathVariable UUID id, @RequestBody Patch b) {
    return view(service.update(Actor.current(), id, b.startDate(), b.endDate(), b.status()));
  }
}
