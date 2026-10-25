package com.smartrent.identity.application;

import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/** Created only by the enabled dev/test configuration, with no public HTTP entry point. */
public class DevAccountProvisioner {
    private final AccountRepository accounts;
    private final PasswordEncoder passwords;

    public DevAccountProvisioner(AccountRepository accounts, PasswordEncoder passwords) {
        this.accounts = accounts;
        this.passwords = passwords;
    }

    @Transactional(timeout = 30)
    public void provision(Map<DevelopmentAccount, String> credentials) {
        for (var slot : DevelopmentAccount.values()) {
            if (credentials == null || credentials.get(slot) == null || credentials.get(slot).isBlank()) {
                throw new IllegalArgumentException("Set required development credential for " + slot.name());
            }
        }
        accounts.acquireProvisioningLock();
        for (var slot : DevelopmentAccount.values()) {
            var existing = accounts.findByEmail(slot.email());
            if (existing.isPresent()) {
                var account = existing.orElseThrow();
                if (account.role() != slot.role() || !matches(credentials.get(slot), account.passwordHash())) {
                    throw new ProvisioningConflictException(slot);
                }
                // Existing credentials, role, active flag and timestamps remain unchanged.
                continue;
            }
            accounts.insert(new Account(UUID.randomUUID(), slot.email(),
                    passwords.encode(credentials.get(slot)), slot.role(), true));
        }
    }

    private boolean matches(String raw, String encoded) {
        try {
            return passwords.matches(raw, encoded);
        } catch (IllegalArgumentException unsupportedEncoding) {
            // Do not disclose a stored hash or overwrite an unrecognized encoding.
            return false;
        }
    }
}
