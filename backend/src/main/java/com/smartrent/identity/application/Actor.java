package com.smartrent.identity.application;

import com.smartrent.identity.domain.AccountRole;
import com.smartrent.shared.api.ApiFailure;
import java.util.UUID;
import org.springframework.security.core.context.SecurityContextHolder;

public record Actor(UUID id, AccountRole role) {
  public boolean landlord() {
    return role == AccountRole.LANDLORD;
  }

  public void requireLandlord() {
    if (!landlord()) throw new ApiFailure(403, "FORBIDDEN", "Access denied.");
  }

  public static Actor current() {
    var a = SecurityContextHolder.getContext().getAuthentication();
    if (a == null || !(a.getPrincipal() instanceof Actor actor)) throw ApiFailure.unauthenticated();
    return actor;
  }
}
