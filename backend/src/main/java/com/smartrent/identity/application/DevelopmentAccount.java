package com.smartrent.identity.application;

import com.smartrent.identity.domain.AccountRole;

/** Fixed synthetic slots; credentials and account roles are not client-selectable. */
public enum DevelopmentAccount {
  LANDLORD_ONE("landlord.one@smartrent.test", AccountRole.LANDLORD),
  LANDLORD_TWO("landlord.two@smartrent.test", AccountRole.LANDLORD),
  TENANT_ONE("tenant.one@smartrent.test", AccountRole.TENANT),
  TENANT_TWO("tenant.two@smartrent.test", AccountRole.TENANT);

  private final String email;
  private final AccountRole role;

  DevelopmentAccount(String email, AccountRole role) {
    this.email = email;
    this.role = role;
  }

  public String email() {
    return email;
  }

  public AccountRole role() {
    return role;
  }

  public String passwordVariable() {
    return "SMARTRENT_SEED_" + name() + "_PASSWORD";
  }
}
