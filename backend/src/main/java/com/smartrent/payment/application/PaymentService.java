package com.smartrent.payment.application;

import com.smartrent.contract.application.ContractAccess;
import com.smartrent.identity.application.Actor;
import com.smartrent.payment.domain.*;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.*;
import com.smartrent.tenant.application.TenantAccess;
import java.math.BigDecimal;
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
  private final Clock clock;
  private final ApplicationEventPublisher events;

  public PaymentService(
      PaymentRepository r,
      ContractAccess c,
      TenantAccess t,
      Clock clock,
      ApplicationEventPublisher e) {
    repo = r;
    contracts = c;
    tenants = t;
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

  private void amount(BigDecimal value) {
    if (value == null
        || value.signum() < 0
        || value.stripTrailingZeros().scale() > 0
        || value.compareTo(new BigDecimal("9999999999")) > 0) throw ApiFailure.invalid();
  }

  private void dates(LocalDate period, LocalDate due) {
    if (period == null || due == null || period.getDayOfMonth() != 1 || due.isBefore(period))
      throw ApiFailure.invalid();
  }

  @Transactional
  public Payment create(
      Actor a, UUID contract, LocalDate period, LocalDate due, BigDecimal amount) {
    a.requireLandlord();
    if (contract == null) throw ApiFailure.invalid();
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
}
