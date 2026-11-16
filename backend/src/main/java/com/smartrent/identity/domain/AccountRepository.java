package com.smartrent.identity.domain;

import java.util.Optional;

/** Module-owned persistence port; callers supply the application transaction. */
public interface AccountRepository {
  void acquireProvisioningLock();

  Optional<Account> findById(java.util.UUID id);

  Optional<Account> findByEmail(String email);

  void insert(Account account);

  java.util.Optional<java.util.UUID> manager(java.util.UUID tenant);

  boolean assignIfAbsent(java.util.UUID tenant, java.util.UUID landlord);
}
