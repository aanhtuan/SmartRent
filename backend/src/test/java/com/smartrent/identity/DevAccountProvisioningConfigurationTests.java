package com.smartrent.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

import com.smartrent.identity.application.DevAccountProvisioner;
import com.smartrent.identity.application.DevAccountProvisioningConfiguration;
import com.smartrent.identity.application.DevelopmentAccount;
import com.smartrent.identity.application.PasswordHashingConfiguration;
import com.smartrent.identity.domain.AccountRepository;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;

@ExtendWith(OutputCaptureExtension.class)
class DevAccountProvisioningConfigurationTests {
  private final AccountRepository accounts = mock(AccountRepository.class);

  private ApplicationContextRunner context(String profiles) {
    return new ApplicationContextRunner()
        .withUserConfiguration(
            DevAccountProvisioningConfiguration.class, PasswordHashingConfiguration.class)
        .withBean(AccountRepository.class, () -> accounts)
        .withInitializer(
            ctx -> {
              if (!profiles.isEmpty()) ctx.getEnvironment().setActiveProfiles(profiles.split(","));
            });
  }

  private String[] credentials() {
    return java.util.Arrays.stream(DevelopmentAccount.values())
        .map(slot -> slot.passwordVariable() + "=" + UUID.randomUUID())
        .toArray(String[]::new);
  }

  @Test
  void disabledByDefaultEvenInProductionWithoutCredentials() {
    context("prod")
        .run(
            ctx -> {
              assertThat(ctx).hasNotFailed().doesNotHaveBean(DevAccountProvisioner.class);
              assertThat(ctx).doesNotHaveBean("devAccountProvisioningRunner");
              verifyNoInteractions(accounts);
            });
  }

  @Test
  void explicitFalseKeepsDevelopmentEnvironmentUnchanged() {
    context("dev")
        .withPropertyValues("smartrent.dev-accounts.enabled=false")
        .run(
            ctx -> {
              assertThat(ctx).hasNotFailed().doesNotHaveBean(DevAccountProvisioner.class);
              assertThat(ctx).doesNotHaveBean("devAccountProvisioningRunner");
              verifyNoInteractions(accounts);
            });
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "",
        "prod",
        "dev,prod",
        "test,prod",
        "dev,test,prod",
        "test,staging",
        "foundation-test"
      })
  void enabledWithAnyNonDevelopmentProfileFailsBeforeDatabaseAccess(String profiles) {
    context(profiles)
        .withPropertyValues("smartrent.dev-accounts.enabled=true")
        .run(
            ctx -> {
              assertThat(ctx).hasFailed();
              assertThat(ctx.getStartupFailure())
                  .hasMessageContaining("only explicit dev/test profiles");
              verifyNoInteractions(accounts);
            });
  }

  @ParameterizedTest
  @ValueSource(strings = {"dev", "test", "dev,test"})
  void explicitAllowedProfilesAndAllCredentialsCreateOptInRunner(String profiles) {
    context(profiles)
        .withPropertyValues("smartrent.dev-accounts.enabled=true")
        .withPropertyValues(credentials())
        .run(
            ctx -> {
              assertThat(ctx).hasNotFailed().hasSingleBean(DevAccountProvisioner.class);
              assertThat(ctx).hasBean("devAccountProvisioningRunner");
              // A plain context does not execute ApplicationRunner; real startup is covered against
              // PostgreSQL.
              verifyNoInteractions(accounts);
            });
  }

  @ParameterizedTest
  @ValueSource(ints = {0, 1, 2, 3})
  void eachMissingCredentialFailsBeforeDatabaseAccess(int missing) {
    String[] supplied = credentials();
    supplied[missing] = DevelopmentAccount.values()[missing].passwordVariable() + "=";
    context("test")
        .withPropertyValues("smartrent.dev-accounts.enabled=true")
        .withPropertyValues(supplied)
        .run(
            ctx -> {
              assertThat(ctx).hasFailed();
              assertThat(ctx.getStartupFailure())
                  .hasStackTraceContaining(
                      "Set required development credential: "
                          + DevelopmentAccount.values()[missing].passwordVariable());
              for (String value : supplied) {
                String raw = value.substring(value.indexOf('=') + 1);
                if (!raw.isEmpty())
                  assertThat(ctx.getStartupFailure().toString().contains(raw)).isFalse();
              }
              verifyNoInteractions(accounts);
            });
  }

  @Test
  void unresolvedPlaceholderFailsWithoutLeakingCredentialInStartupError(CapturedOutput output) {
    String secret = UUID.randomUUID().toString();
    String key = DevelopmentAccount.LANDLORD_ONE.passwordVariable();
    context("dev")
        .withPropertyValues("smartrent.dev-accounts.enabled=true")
        .withPropertyValues(credentials())
        .withPropertyValues(key + "=" + secret + "-${SMARTRENT_NONEXISTENT_TEST_SECRET}")
        .run(
            ctx -> {
              assertThat(ctx).hasFailed();
              var trace = new StringWriter();
              ctx.getStartupFailure().printStackTrace(new PrintWriter(trace));
              assertThat(trace.toString().contains(secret)).isFalse();
              assertThat(output.getAll().contains(secret)).isFalse();
              assertThat(trace.toString()).contains("Set required development credential: " + key);
              verifyNoInteractions(accounts);
            });
  }

  @Test
  void unresolvedLiteralIsRejectedEvenWhenEnvironmentIgnoresNestedPlaceholders() {
    context("test")
        .withInitializer(ctx -> ctx.getEnvironment().setIgnoreUnresolvableNestedPlaceholders(true))
        .withPropertyValues("smartrent.dev-accounts.enabled=true")
        .withPropertyValues(credentials())
        .withPropertyValues(
            DevelopmentAccount.TENANT_TWO.passwordVariable()
                + "=${SMARTRENT_NONEXISTENT_TEST_SECRET}")
        .run(
            ctx -> {
              assertThat(ctx).hasFailed();
              verifyNoInteractions(accounts);
            });
  }
}
