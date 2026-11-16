package com.smartrent.payment.application;

import com.smartrent.contract.application.ContractAccess;
import com.smartrent.identity.application.Actor;
import com.smartrent.payment.domain.*;
import com.smartrent.property.application.PropertyAccess;
import com.smartrent.room.application.RoomAccess;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.*;
import com.smartrent.tenant.application.TenantAccess;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.util.*;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class PaymentService {
  private final PaymentRepository repo;
  private final ContractAccess contracts;
  private final TenantAccess tenants;
  private final RoomAccess rooms;
  private final PropertyAccess properties;
  private final Clock clock;
  private final ApplicationEventPublisher events;

  public PaymentService(
      PaymentRepository r,
      ContractAccess c,
      TenantAccess t,
      Clock clock,
      ApplicationEventPublisher e) {
    this(r, c, t, null, null, clock, e);
  }

  public PaymentService(
      PaymentRepository r,
      ContractAccess c,
      TenantAccess t,
      RoomAccess rooms,
      PropertyAccess properties,
      Clock clock,
      ApplicationEventPublisher e) {
    repo = r;
    contracts = c;
    tenants = t;
    this.rooms = rooms;
    this.properties = properties;
    this.clock = clock;
    events = e;
  }

  public String status(Payment p) {
    return p.status.equals("PAID")
        ? "PAID"
        : p.dueDate.isBefore(LocalDate.now(clock)) ? "OVERDUE" : "PENDING";
  }

  @Transactional(readOnly = true)
  public Payment visible(UUID id, Actor a) {
    var p = repo.find(id, false);
    if (p == null) throw ApiFailure.missing();
    contracts.visible(p.contractId, a);
    return p;
  }

  @Transactional(readOnly = true)
  public PageResponse<Payment> list(Actor a, UUID contract, String status, int page, int size) {
    if (contract != null) contracts.visible(contract, a);
    if (status != null) Inputs.choice(status, "PAID", "PENDING", "OVERDUE");
    return new PageResponse<>(
        repo.visible(a.id(), a.landlord(), contract, status, PageResponse.offset(page, size), size),
        page,
        size);
  }

  private void dates(LocalDate period, LocalDate due) {
    if (period.getDayOfMonth() != 1 || due.isBefore(period)) throw ApiFailure.invalid();
  }

  private void amount(BigDecimal amount) {
    if (amount.compareTo(BigDecimal.ZERO) < 0
        || amount.remainder(BigDecimal.ONE).compareTo(BigDecimal.ZERO) != 0)
      throw ApiFailure.invalid();
  }

  @Transactional
  public Payment create(Actor a, UUID contract, LocalDate period, LocalDate due, BigDecimal amount) {
    a.requireLandlord();
    var c = contracts.lockOwned(contract, a);
    dates(period, due);
    amount(amount);
    if (period.isAfter(c.endDate)
        || period.plusMonths(1).minusDays(1).isBefore(c.startDate)
        || c.status.equals("TERMINATED") && c.startDate.isAfter(LocalDate.now(clock)))
      throw ApiFailure.state();
    var p = new Payment();
    p.contractId = contract;
    p.billingPeriod = period;
    p.dueDate = due;
    p.amount = amount;
    p.status = "PENDING";
    p = repo.save(p);
    events.publishEvent(
        new BusinessNotice(tenants.user(c.tenantProfileId), "PAYMENT_REMINDER", "payment", p.id));
    return p;
  }

  @Transactional
  public Payment update(Actor a, UUID id, String status, BigDecimal amount, LocalDate due) {
    a.requireLandlord();
    var old = visible(id, a);
    var c = contracts.lockOwned(old.contractId, a);
    var p = repo.find(id, true);
    if (p.status.equals("PAID")) throw ApiFailure.state();
    if (status == null && amount == null && due == null) throw ApiFailure.invalid();
    if (status != null && !status.equals("PAID")) throw ApiFailure.invalid();
    if (amount != null) {
      amount(amount);
      p.amount = amount;
    }
    if (due != null) {
      dates(p.billingPeriod, due);
      p.dueDate = due;
    }
    if (status != null) p.status = status;
    p = repo.save(p);
    events.publishEvent(
        new BusinessNotice(tenants.user(c.tenantProfileId), "PAYMENT_UPDATED", "payment", p.id));
    return p;
  }

  @Transactional(readOnly = true)
  public LandlordBankAccount getBankAccount(Actor a) {
    a.requireLandlord();
    return repo.findBankAccountByLandlord(a.id());
  }

  @Transactional
  public LandlordBankAccount updateBankAccount(
      Actor a, String bankBin, String bankName, String accountNumber, String accountHolderName) {
    a.requireLandlord();
    if (bankBin == null || bankBin.isBlank()
        || accountNumber == null || accountNumber.isBlank()
        || accountHolderName == null || accountHolderName.isBlank()) {
      throw ApiFailure.invalid();
    }
    var b = repo.findBankAccountByLandlord(a.id());
    if (b == null) {
      b = new LandlordBankAccount();
      b.landlordUserId = a.id();
    }
    b.bankBin = bankBin.trim();
    b.bankName = bankName == null ? "" : bankName.trim();
    b.accountNumber = accountNumber.trim();
    b.accountHolderName = accountHolderName.trim().toUpperCase();
    return repo.saveBankAccount(b);
  }

  @Transactional(readOnly = true)
  public String getVietQrUrl(Payment payment) {
    if (payment == null || rooms == null || properties == null) return null;
    try {
      var c = contracts.internal(payment.contractId);
      var r = rooms.internal(c.roomId);
      var p = properties.internal(r.propertyId);
      var bank = repo.findBankAccountByLandlord(p.ownerUserId);
      if (bank == null) return null;

      String encodedName = URLEncoder.encode(bank.accountHolderName, StandardCharsets.UTF_8);
      String ref = payment.paymentReference != null ? payment.paymentReference : "SR" + payment.id.toString().substring(0, 8).toUpperCase();
      return String.format(
          "https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
          bank.bankBin,
          bank.accountNumber,
          payment.amount.toBigInteger().toString(),
          ref,
          encodedName);
    } catch (Exception ex) {
      return null;
    }
  }

  @Transactional
  public Payment processWebhookPayment(String reference, BigDecimal amount) {
    if (reference == null || reference.isBlank() || amount == null) {
      throw ApiFailure.invalid();
    }
    var p = repo.findByReference(reference);
    if (p == null) {
      throw ApiFailure.missing();
    }
    if (p.amount.compareTo(amount) != 0) {
      throw new ApiFailure(400, "AMOUNT_MISMATCH", "Payment amount does not match invoice amount.");
    }
    if (p.status.equals("PAID")) {
      return p;
    }
    p.status = "PAID";
    p = repo.save(p);
    var c = contracts.internal(p.contractId);
    events.publishEvent(
        new BusinessNotice(tenants.user(c.tenantProfileId), "PAYMENT_UPDATED", "payment", p.id));
    return p;
  }
}
