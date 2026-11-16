package com.smartrent.payment.application;

import com.smartrent.contract.application.ContractBillingGuard;
import com.smartrent.payment.domain.PaymentRepository;
import com.smartrent.shared.api.ApiFailure;
import java.time.LocalDate;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("!foundation-test")
class PaymentDatesGuard implements ContractBillingGuard {
  private final PaymentRepository repo;

  PaymentDatesGuard(PaymentRepository r) {
    repo = r;
  }

  public void ensureDates(UUID id, LocalDate start, LocalDate end) {
    if (repo.outsideDates(id, start, end)) throw ApiFailure.state();
  }
}
