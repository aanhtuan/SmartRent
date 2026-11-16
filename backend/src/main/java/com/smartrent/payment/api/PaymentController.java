package com.smartrent.payment.api;

import com.smartrent.identity.application.Actor;
import com.smartrent.payment.application.PaymentService;
import com.smartrent.payment.domain.LandlordBankAccount;
import com.smartrent.payment.domain.Payment;
import com.smartrent.shared.api.PageResponse;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

@RestController
@Profile("!foundation-test")
public class PaymentController {
  private final PaymentService service;

  public PaymentController(PaymentService s) {
    service = s;
  }

  public record Create(
      UUID contractId, LocalDate billingPeriod, LocalDate dueDate, BigDecimal amount) {}

  public record Patch(String status, BigDecimal amount, LocalDate dueDate) {}

  public record BankAccountBody(
      String bankBin, String bankName, String accountNumber, String accountHolderName) {}

  public record BankAccountView(
      UUID id,
      UUID landlordUserId,
      String bankBin,
      String bankName,
      String accountNumber,
      String accountHolderName,
      Instant updatedAt) {}

  public record WebhookBody(String reference, BigDecimal amount) {}

  public record View(
      UUID id,
      UUID contractId,
      LocalDate billingPeriod,
      LocalDate dueDate,
      BigDecimal amount,
      String status,
      String paymentReference,
      String vietQrUrl) {}

  private View view(Payment p) {
    return new View(
        p.id,
        p.contractId,
        p.billingPeriod,
        p.dueDate,
        p.amount,
        service.status(p),
        p.paymentReference,
        service.getVietQrUrl(p));
  }

  private BankAccountView bankView(LandlordBankAccount b) {
    if (b == null) return null;
    return new BankAccountView(
        b.id,
        b.landlordUserId,
        b.bankBin,
        b.bankName,
        b.accountNumber,
        b.accountHolderName,
        b.updatedAt);
  }

  @GetMapping("/api/payments")
  Object list(
      @RequestParam(name = "contract_id", required = false) UUID contract,
      @RequestParam(required = false) String status,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(name = "page_size", defaultValue = "20") int size) {
    var p = service.list(Actor.current(), contract, status, page, size);
    return new PageResponse<>(p.items().stream().map(this::view).toList(), page, size);
  }

  @PostMapping("/api/payments")
  @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
  Object create(@RequestBody Create b) {
    return view(
        service.create(
            Actor.current(), b.contractId(), b.billingPeriod(), b.dueDate(), b.amount()));
  }

  @GetMapping("/api/payments/{id}")
  Object get(@PathVariable UUID id) {
    return view(service.visible(id, Actor.current()));
  }

  @PatchMapping("/api/payments/{id}")
  Object patch(@PathVariable UUID id, @RequestBody Patch b) {
    return view(service.update(Actor.current(), id, b.status(), b.amount(), b.dueDate()));
  }

  @GetMapping("/api/landlords/bank-account")
  Object getBankAccount() {
    return bankView(service.getBankAccount(Actor.current()));
  }

  @PutMapping("/api/landlords/bank-account")
  Object updateBankAccount(@RequestBody BankAccountBody b) {
    return bankView(
        service.updateBankAccount(
            Actor.current(),
            b.bankBin(),
            b.bankName(),
            b.accountNumber(),
            b.accountHolderName()));
  }

  @PostMapping("/api/webhooks/payment")
  Object webhook(@RequestBody WebhookBody b) {
    var p = service.processWebhookPayment(b.reference(), b.amount());
    return Map.of("success", true, "payment_id", p.id, "status", p.status);
  }
}
