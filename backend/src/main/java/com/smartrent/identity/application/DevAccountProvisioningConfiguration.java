package com.smartrent.identity.application;

import com.smartrent.identity.domain.AccountRepository;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration(proxyBeanMethods = false)
@ConditionalOnProperty(prefix = "smartrent.dev-accounts", name = "enabled", havingValue = "true")
public class DevAccountProvisioningConfiguration {
  @Bean
  static BeanFactoryPostProcessor requireDevelopmentProfiles(Environment environment) {
    return factory -> {
      var profiles = environment.getActiveProfiles();
      if (profiles.length == 0
          || Arrays.stream(profiles)
              .anyMatch(profile -> !profile.equals("dev") && !profile.equals("test"))) {
        throw new IllegalStateException(
            "Development provisioning requires only explicit dev/test profiles");
      }
    };
  }

  @Bean
  DevAccountProvisioner devAccountProvisioner(AccountRepository accounts, PasswordEncoder encoder) {
    return new DevAccountProvisioner(accounts, encoder);
  }

  @Bean
  @org.springframework.core.annotation.Order(0)
  ApplicationRunner devAccountProvisioningRunner(
      DevAccountProvisioner provisioner, Environment environment) {
    var credentials = new EnumMap<DevelopmentAccount, String>(DevelopmentAccount.class);
    for (var slot : DevelopmentAccount.values()) {
      credentials.put(slot, requiredCredential(environment, slot));
    }
    var immutableCredentials = Map.copyOf(credentials);
    return new ProvisioningRunner(provisioner, immutableCredentials);
  }

  private static String requiredCredential(Environment environment, DevelopmentAccount slot) {
    String raw;
    try {
      raw = environment.getProperty(slot.passwordVariable());
    } catch (IllegalArgumentException unresolvedPlaceholder) {
      // Spring's original exception may contain the property value. Never retain its cause.
      throw missingCredential(slot);
    }
    if (raw == null || raw.isBlank() || raw.contains("${")) {
      throw missingCredential(slot);
    }
    return raw;
  }

  private static IllegalStateException missingCredential(DevelopmentAccount slot) {
    return new IllegalStateException(
        "Set required development credential: " + slot.passwordVariable());
  }

  private record ProvisioningRunner(
      DevAccountProvisioner provisioner, Map<DevelopmentAccount, String> credentials)
      implements ApplicationRunner, org.springframework.core.Ordered {
    public int getOrder() {
      return 0;
    }

    public void run(org.springframework.boot.ApplicationArguments args) {
      provisioner.provision(credentials);
    }
  }
}
