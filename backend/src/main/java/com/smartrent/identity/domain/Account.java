package com.smartrent.identity.domain;

import java.util.Objects;
import java.util.UUID;

/** Internal identity value; must never be serialized as an HTTP response. */
public record Account(
    UUID id, String email, String passwordHash, AccountRole role, boolean active) {
  public Account {
    Objects.requireNonNull(id);
    Objects.requireNonNull(email);
    Objects.requireNonNull(passwordHash);
    Objects.requireNonNull(role);
  }

  @Override
  public String toString() {
    return "Account[id=" + id + ", role=" + role + ", active=" + active + ", credentials=REDACTED]";
  }
}
