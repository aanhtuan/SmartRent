package com.smartrent.identity.domain;

import java.util.Optional;

/** Module-owned persistence port; callers supply the application transaction. */
public interface AccountRepository {
    void acquireProvisioningLock();
    Optional<Account> findByEmail(String email);
    void insert(Account account);
}
