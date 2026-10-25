package com.smartrent.payment.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.payment.domain.Payment;
import com.smartrent.shared.api.PageResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
@RequestMapping("/api/payments")
public class PaymentController {
  private final PaymentService service;

  public PaymentController(PaymentService s) {
    service = s;
  }

  public record Create(
      UUID contractId, LocalDate billingPeriod, LocalDate dueDate, BigDecimal amount) {}

  public record Patch(String status, BigDecimal amount, LocalDate dueDate) {}

  public record View(
      UUID id,
      UUID contractId,
      LocalDate billingPeriod,
      LocalDate dueDate,
      BigDecimal amount,
      String status) {}

  private View view(Payment p) {
    return new View(p.id, p.contractId, p.billingPeriod, p.dueDate, p.amount, service.status(p));
  }

  @GetMapping
  Object list(
      @RequestParam(name = "contract_id", required = false) UUID contract,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = service.list(Actor.current(), contract, status, page, size);
    return new PageResponse<>(p.items().stream().map(this::view).toList(), page, size);
  }

  @PostMapping
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  Object create(@RequestBody Create b) {
    return view(
        service.create(
            Actor.current(), b.contractId(), b.billingPeriod(), b.dueDate(), b.amount()));
  }

  @GetMapping("/{id}")
  Object get(@PathVariable UUID id) {
    return view(service.visible(id, Actor.current()));
  }

  @PatchMapping("/{id}")
  Object patch(@PathVariable UUID id, @RequestBody Patch b) {
    return view(service.update(Actor.current(), id, b.status(), b.amount(), b.dueDate()));
  }
}
