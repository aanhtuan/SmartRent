package com.smartrent.contract.application;

import java.time.LocalDate;
import java.util.UUID;

public interface ContractBillingGuard {
  void ensureDates(UUID contract, LocalDate start, LocalDate end);
}
