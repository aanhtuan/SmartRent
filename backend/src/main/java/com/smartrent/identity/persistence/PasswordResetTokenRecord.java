package com.smartrent.identity.persistence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetTokenRecord {
  @Id public UUID id;

  @Column(name = "user_id", nullable = false)
  public UUID userId;

  @Column(nullable = false, unique = true)
  public String token;

  @Column(name = "expires_at", nullable = false)
  public Instant expiresAt;

  @Column(nullable = false)
  public boolean used;

  @Column(name = "created_at", nullable = false)
  public Instant createdAt;
}
