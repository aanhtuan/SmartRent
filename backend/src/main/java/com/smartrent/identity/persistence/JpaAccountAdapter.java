package com.smartrent.identity.persistence;

import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.Optional;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("!foundation-test")
class JpaAccountAdapter implements AccountRepository {
  @PersistenceContext private EntityManager entities;

  @Override
  public void acquireProvisioningLock() {
    // Transaction-scoped: released on commit/rollback, no lock table or migration needed.
    // The constant belongs only to development-account provisioning, not ordinary identity queries.
    entities.createNativeQuery("SELECT 1 FROM pg_advisory_xact_lock(1397904388)").getSingleResult();
  }

  @Override
  public Optional<Account> findById(java.util.UUID id) {
    return Optional.ofNullable(entities.find(UserRecord.class, id)).map(UserRecord::toAccount);
  }

  @Override
  public Optional<Account> findByEmail(String email) {
    return entities
        .createQuery("SELECT u FROM UserRecord u WHERE u.email = :email", UserRecord.class)
        .setParameter("email", email)
        .setMaxResults(1)
        .getResultList()
        .stream()
        .findFirst()
        .map(UserRecord::toAccount);
  }

  @Override
  public void insert(Account account) {
    entities.persist(new UserRecord(account));
    entities.flush();
  }

  @Override
  public Optional<java.util.UUID> manager(java.util.UUID tenant) {
    var rows =
        entities
            .createNativeQuery(
                "SELECT provisioned_by_user_id FROM users WHERE id=:id AND role='TENANT'")
            .setParameter("id", tenant)
            .getResultList();
    return rows.isEmpty() ? Optional.empty() : Optional.ofNullable((java.util.UUID) rows.get(0));
  }

  @Override
  public boolean assignIfAbsent(java.util.UUID tenant, java.util.UUID landlord) {
    return entities
            .createNativeQuery(
                "UPDATE users SET provisioned_by_user_id=:landlord,updated_at=CURRENT_TIMESTAMP"
                    + " WHERE id=:tenant AND role='TENANT' AND provisioned_by_user_id IS NULL")
            .setParameter("tenant", tenant)
            .setParameter("landlord", landlord)
            .executeUpdate()
        == 1;
  }
}
