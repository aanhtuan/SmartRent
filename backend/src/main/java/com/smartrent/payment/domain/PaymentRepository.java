package com.smartrent.payment.domain;

import java.util.*;

public interface PaymentRepository {
  Payment find(UUID id, boolean lock);

  Payment save(Payment value);

  boolean outsideDates(UUID contract, java.time.LocalDate start, java.time.LocalDate end);

  List<Payment> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit);
}
