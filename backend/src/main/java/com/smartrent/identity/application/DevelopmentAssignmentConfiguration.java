package com.smartrent.identity.application;

import com.smartrent.identity.domain.*;
import java.util.*;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.*;
import org.springframework.core.Ordered;
import org.springframework.core.env.Environment;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
@ConditionalOnProperty(name = "SMARTRENT_DEV_ASSIGNMENTS_ENABLED", havingValue = "true")
public class DevelopmentAssignmentConfiguration {
  @Bean
  static BeanFactoryPostProcessor assignmentProfiles(Environment e) {
    return f -> {
      if (e.getActiveProfiles().length == 0
          || Arrays.stream(e.getActiveProfiles())
              .anyMatch(p -> !p.equals("dev") && !p.equals("test")))
        throw new IllegalStateException("Development assignments require only dev/test profiles.");
    };
  }

  @Bean
  ApplicationRunner assignDevelopmentAccounts(
      AccountRepository accounts, PlatformTransactionManager tx) {
    return new AssignmentRunner(accounts, new TransactionTemplate(tx));
  }

  private record AssignmentRunner(AccountRepository accounts, TransactionTemplate tx)
      implements ApplicationRunner, Ordered {
    public int getOrder() {
      return Ordered.LOWEST_PRECEDENCE;
    }

    public void run(org.springframework.boot.ApplicationArguments args) {
      tx.executeWithoutResult(
          t -> {
            accounts.acquireProvisioningLock();
            for (var pair :
                List.of(
                    List.of(DevelopmentAccount.TENANT_ONE, DevelopmentAccount.LANDLORD_ONE),
                    List.of(DevelopmentAccount.TENANT_TWO, DevelopmentAccount.LANDLORD_TWO))) {
              var tenant =
                  accounts
                      .findByEmail(pair.get(0).email())
                      .filter(a -> a.role() == AccountRole.TENANT)
                      .orElseThrow(
                          () ->
                              new IllegalStateException(
                                  "Provision synthetic accounts before assignments."));
              var landlord =
                  accounts
                      .findByEmail(pair.get(1).email())
                      .filter(a -> a.role() == AccountRole.LANDLORD)
                      .orElseThrow(
                          () ->
                              new IllegalStateException(
                                  "Provision synthetic accounts before assignments."));
              var current = accounts.manager(tenant.id());
              if (current.isPresent() && !current.get().equals(landlord.id()))
                throw new IllegalStateException(
                    "Existing assignment conflict; identity preserved.");
              if (current.isEmpty() && !accounts.assignIfAbsent(tenant.id(), landlord.id()))
                throw new IllegalStateException("Assignment conflict.");
            }
          });
    }
  }
}
