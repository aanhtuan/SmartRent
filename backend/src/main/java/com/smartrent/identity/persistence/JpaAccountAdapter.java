package com.smartrent.identity.persistence;

import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
@Profile("!foundation-test")
class JpaAccountAdapter implements AccountRepository {
    @PersistenceContext
    private EntityManager entities;

    @Override
    public void acquireProvisioningLock() {
        // Transaction-scoped: released on commit/rollback, no lock table or migration needed.
        // The constant belongs only to development-account provisioning, not ordinary identity queries.
        entities.createNativeQuery("SELECT 1 FROM pg_advisory_xact_lock(1397904388)")
                .getSingleResult();
    }

    @Override
    public Optional<Account> findByEmail(String email) {
        return entities.createQuery("SELECT u FROM UserRecord u WHERE u.email = :email", UserRecord.class)
                .setParameter("email", email).setMaxResults(1).getResultList().stream()
                .findFirst().map(UserRecord::toAccount);
    }

    @Override
    public void insert(Account account) {
        entities.persist(new UserRecord(account));
        entities.flush();
    }
}
