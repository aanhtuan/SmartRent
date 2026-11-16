package com.smartrent.identity.application;

import com.smartrent.identity.domain.*;
import com.smartrent.shared.api.ApiFailure;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Profile("!foundation-test")
public class IdentityQueries {
  private final AccountRepository accounts;

  public IdentityQueries(AccountRepository accounts) {
    this.accounts = accounts;
  }

  @Transactional(readOnly = true)
  public boolean assigned(UUID tenant, UUID landlord) {
    return accounts.manager(tenant).filter(landlord::equals).isPresent();
  }

  @Transactional(readOnly = true)
  public Account active(UUID id) {
    return accounts.findById(id).filter(Account::active).orElseThrow(ApiFailure::unauthenticated);
  }
}
