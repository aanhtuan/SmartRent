package com.smartrent.identity.persistence;

import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;
import java.util.Locale;

/** Persistence mapping only; not an API response or authentication implementation. */
@Entity
@Table(name = "users")
class UserRecord {
    @Id
    private UUID id;

    @Column(nullable = false, length = 320)
    private String email;

    @Column(name = "password_hash", nullable = false, columnDefinition = "text")
    private String passwordHash;

    @Column(nullable = false, columnDefinition = "text")
    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserRecord() {
    }

    UserRecord(String email, String passwordHash, UserRole role) {
        this(UUID.randomUUID(), email, passwordHash, role);
    }

    UserRecord(Account account) {
        this(account.id(), account.email(), account.passwordHash(), UserRole.valueOf(account.role().name()));
        this.active = account.active();
    }

    private UserRecord(UUID id, String email, String passwordHash, UserRole role) {
        this.id = id;
        this.email = email.strip().toLowerCase(Locale.ROOT);
        this.passwordHash = passwordHash;
        this.role = role;
        this.active = true;
    }

    Account toAccount() {
        return new Account(id, email, passwordHash, AccountRole.valueOf(role.name()), active);
    }

    UUID id() { return id; }
    Instant updatedAt() { return updatedAt; }
    void deactivate() { active = false; }

    @PrePersist
    void initializeTimestamps() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }
}
