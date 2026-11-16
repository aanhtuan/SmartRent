package com.smartrent.identity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.smartrent.identity.application.DevAccountProvisioner;
import com.smartrent.identity.application.DevelopmentAccount;
import com.smartrent.identity.application.ProvisioningConflictException;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.util.ArrayList;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.system.CapturedOutput;
import org.springframework.boot.test.system.OutputCaptureExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;
import org.testcontainers.utility.MountableFile;

@Testcontainers
@ActiveProfiles("test")
@ExtendWith(OutputCaptureExtension.class)
@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = "smartrent.dev-accounts.enabled=true")
class DevAccountProvisioningTests {
  private static final AtomicBoolean FIRST_FIXTURE = new AtomicBoolean(true);
  private static final String MIGRATION_PASSWORD = UUID.randomUUID().toString();
  private static final String APP_PASSWORD = UUID.randomUUID().toString();
  private static final EnumMap<DevelopmentAccount, String> PASSWORDS = passwords();

  @Container
  static final PostgreSQLContainer<?> POSTGRES =
      new PostgreSQLContainer<>(
              DockerImageName.parse(
                      "postgres:17.11-bookworm@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826")
                  .asCompatibleSubstituteFor("postgres"))
          .withDatabaseName("smartrent_provisioning_test")
          .withUsername("smartrent_admin")
          .withPassword(UUID.randomUUID().toString())
          .withEnv("DB_MIGRATION_PASSWORD", MIGRATION_PASSWORD)
          .withEnv("DB_PASSWORD", APP_PASSWORD)
          .withCopyFileToContainer(
              MountableFile.forHostPath(
                  Path.of("..", "infra", "postgres", "01-roles.sh").toAbsolutePath()),
              "/docker-entrypoint-initdb.d/01-roles.sh");

  @DynamicPropertySource
  static void databaseProperties(DynamicPropertyRegistry registry) {
    com.smartrent.TestJwtKeys.configure(registry);
    registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
    registry.add("spring.datasource.username", () -> "smartrent_app");
    registry.add("spring.datasource.password", () -> APP_PASSWORD);
    registry.add("spring.flyway.url", POSTGRES::getJdbcUrl);
    registry.add("spring.flyway.user", () -> "smartrent_migrator");
    registry.add("spring.flyway.password", () -> MIGRATION_PASSWORD);
    registry.add("spring.flyway.placeholders.applicationRole", () -> "smartrent_app");
    PASSWORDS.forEach((slot, value) -> registry.add(slot.passwordVariable(), () -> value));
  }

  @Autowired DevAccountProvisioner provisioner;
  @Autowired PasswordEncoder encoder;

  @Autowired
  @Qualifier("devAccountProvisioningRunner")
  ApplicationRunner runner;

  private static EnumMap<DevelopmentAccount, String> passwords() {
    var values = new EnumMap<DevelopmentAccount, String>(DevelopmentAccount.class);
    for (var slot : DevelopmentAccount.values()) values.put(slot, UUID.randomUUID().toString());
    return values;
  }

  private Connection connection(String username, String password) throws Exception {
    return DriverManager.getConnection(POSTGRES.getJdbcUrl(), username, password);
  }

  @BeforeEach
  void clearOnlyThisEphemeralFixture() throws Exception {
    if (FIRST_FIXTURE.getAndSet(false)) assertThat(snapshot().size()).isEqualTo(4);
    // The test-owned container is independent of the existing local Compose volume.
    try (var c = connection(POSTGRES.getUsername(), POSTGRES.getPassword());
        var s = c.createStatement()) {
      s.executeUpdate("DELETE FROM users");
    }
  }

  private Map<String, List<Object>> snapshot() throws Exception {
    var rows = new LinkedHashMap<String, List<Object>>();
    try (var c = connection("smartrent_app", APP_PASSWORD);
        var s = c.createStatement();
        var r =
            s.executeQuery(
                "SELECT id,email,password_hash,role,is_active,created_at,updated_at FROM users"
                    + " ORDER BY email")) {
      while (r.next()) {
        var fields = new ArrayList<Object>();
        for (int i = 1; i <= 7; i++) fields.add(r.getObject(i));
        rows.put(r.getString("email"), fields);
      }
    }
    return rows;
  }

  private void insertExisting(String email, String hash, String role) throws Exception {
    try (var c = connection("smartrent_app", APP_PASSWORD);
        var s =
            c.prepareStatement(
                "INSERT INTO users(id,email,password_hash,role,is_active) VALUES(?,?,?,?,false)")) {
      s.setObject(1, UUID.randomUUID());
      s.setString(2, email);
      s.setString(3, hash);
      s.setString(4, role);
      s.executeUpdate();
    }
  }

  @Test
  void configuredRunnerCreatesExactlyTwoLandlordsAndTwoTenants(CapturedOutput output)
      throws Exception {
    runner.run(new DefaultApplicationArguments(new String[0]));
    var rows = snapshot();
    assertThat(rows.size()).isEqualTo(4);
    assertThat(rows.values().stream().filter(row -> row.get(3).equals("LANDLORD")).count())
        .isEqualTo(2);
    assertThat(rows.values().stream().filter(row -> row.get(3).equals("TENANT")).count())
        .isEqualTo(2);
    for (var slot : DevelopmentAccount.values()) {
      var fields = rows.get(slot.email());
      assertThat(fields != null).isTrue();
      assertThat(fields.get(0) instanceof UUID).isTrue();
      assertThat(fields.get(3)).isEqualTo(slot.role().name());
      assertThat(fields.get(4)).isEqualTo(true);
      String encoded = (String) fields.get(2);
      assertThat(encoded.startsWith("{argon2id-v1}$argon2id$")).isTrue();
      assertThat(encoded.contains("m=19456,t=2,p=1")).isTrue();
      assertThat(encoder.matches(PASSWORDS.get(slot), encoded)).isTrue();
      assertThat(output.getAll().contains(encoded)).isFalse();
      assertThat(output.getAll().contains(PASSWORDS.get(slot))).isFalse();
    }
  }

  @Test
  void repeatedRunPreservesIdsCredentialsRolesInactiveStatusAndTimestamps() throws Exception {
    provisioner.provision(PASSWORDS);
    try (var c = connection("smartrent_app", APP_PASSWORD);
        var s = c.createStatement()) {
      s.executeUpdate("UPDATE users SET is_active=false WHERE email='tenant.one@smartrent.test'");
    }
    var before = snapshot();
    provisioner.provision(PASSWORDS);
    // Compare as boolean so a failing assertion never prints hashes.
    assertThat(snapshot().equals(before)).isTrue();
  }

  @Test
  void differentPasswordConflictRollsBackEarlierInsertsAndPreservesExistingIdentity()
      throws Exception {
    insertExisting(
        DevelopmentAccount.TENANT_TWO.email(),
        encoder.encode(UUID.randomUUID().toString()),
        "TENANT");
    var before = snapshot();
    assertThatThrownBy(() -> provisioner.provision(PASSWORDS))
        .isInstanceOf(ProvisioningConflictException.class);
    assertThat(snapshot().equals(before)).isTrue();
  }

  @Test
  void differentRoleConflictRollsBackEarlierInsertsWithoutChangingRole() throws Exception {
    insertExisting(
        DevelopmentAccount.TENANT_TWO.email(),
        encoder.encode(PASSWORDS.get(DevelopmentAccount.TENANT_TWO)),
        "LANDLORD");
    var before = snapshot();
    assertThatThrownBy(() -> provisioner.provision(PASSWORDS))
        .isInstanceOf(ProvisioningConflictException.class);
    assertThat(snapshot().equals(before)).isTrue();
  }

  @Test
  void unrecognizedExistingHashIsAConflictAndIsNeverReplaced() throws Exception {
    insertExisting(
        DevelopmentAccount.TENANT_TWO.email(), "synthetic-unrecognized-encoding", "TENANT");
    var before = snapshot();
    assertThatThrownBy(() -> provisioner.provision(PASSWORDS))
        .isInstanceOf(ProvisioningConflictException.class);
    assertThat(snapshot().equals(before)).isTrue();
  }

  @Test
  void missingPasswordWritesNothingAndDoesNotExposeOtherPasswords(CapturedOutput output)
      throws Exception {
    var incomplete = new EnumMap<>(PASSWORDS);
    incomplete.remove(DevelopmentAccount.TENANT_TWO);
    assertThatThrownBy(() -> provisioner.provision(incomplete))
        .isInstanceOf(IllegalArgumentException.class)
        .hasMessageContaining("TENANT_TWO");
    assertThat(snapshot().isEmpty()).isTrue();
    PASSWORDS.values().forEach(p -> assertThat(output.getAll().contains(p)).isFalse());
  }

  @Test
  void concurrentRunsSerializeAndRemainIdempotent() throws Exception {
    var start = new CountDownLatch(1);
    try (var pool = Executors.newFixedThreadPool(2)) {
      var first =
          pool.submit(
              () -> {
                start.await();
                provisioner.provision(PASSWORDS);
                return null;
              });
      var second =
          pool.submit(
              () -> {
                start.await();
                provisioner.provision(PASSWORDS);
                return null;
              });
      start.countDown();
      first.get(30, TimeUnit.SECONDS);
      second.get(30, TimeUnit.SECONDS);
    }
    assertThat(snapshot().size()).isEqualTo(4);
  }

  @Test
  void unrelatedExistingUsersAreUntouched() throws Exception {
    insertExisting(
        "retained@smartrent.test", encoder.encode(UUID.randomUUID().toString()), "LANDLORD");
    var before = snapshot().get("retained@smartrent.test");
    provisioner.provision(PASSWORDS);
    assertThat(snapshot().size()).isEqualTo(5);
    assertThat(snapshot().get("retained@smartrent.test").equals(before)).isTrue();
  }

  @Test
  void provisioningWaitsForDatabaseLockAndReleasesItOnCommit() throws Exception {
    try (var pool = Executors.newSingleThreadExecutor();
        var holder = connection("smartrent_app", APP_PASSWORD)) {
      holder.setAutoCommit(false);
      try (var statement = holder.createStatement()) {
        statement.execute("SELECT pg_advisory_xact_lock(1397904388)");
      }
      var waiting =
          pool.submit(
              () -> {
                provisioner.provision(PASSWORDS);
                return null;
              });
      try {
        long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5);
        boolean blocked = false;
        while (!blocked && System.nanoTime() < deadline) {
          try (var statement = holder.createStatement();
              var rows =
                  statement.executeQuery(
                      "SELECT EXISTS (SELECT 1 FROM pg_locks WHERE locktype='advisory' "
                          + "AND objid=1397904388 AND NOT granted)")) {
            rows.next();
            blocked = rows.getBoolean(1);
          }
          if (!blocked) Thread.sleep(10);
        }
        assertThat(blocked).isTrue();
        assertThat(waiting.isDone()).isFalse();
        assertThat(snapshot().isEmpty()).isTrue();
      } finally {
        holder.rollback();
      }
      waiting.get(10, TimeUnit.SECONDS);
    }
    assertThat(snapshot().size()).isEqualTo(4);
    assertProvisioningLockIsAvailable();
  }

  @Test
  void rollbackReleasesLockAndAllowsSafeRetryWithoutExposingCredentials(CapturedOutput output)
      throws Exception {
    String originalPassword = UUID.randomUUID().toString();
    String existingHash = encoder.encode(originalPassword);
    insertExisting(DevelopmentAccount.TENANT_TWO.email(), existingHash, "TENANT");
    var before = snapshot();
    assertThatThrownBy(() -> provisioner.provision(PASSWORDS))
        .isInstanceOf(ProvisioningConflictException.class)
        .hasMessage("Development account conflict for TENANT_TWO; stored identity was preserved.");
    assertThat(snapshot().equals(before)).isTrue();
    assertProvisioningLockIsAvailable();
    var matching = new EnumMap<>(PASSWORDS);
    matching.put(DevelopmentAccount.TENANT_TWO, originalPassword);
    provisioner.provision(matching);
    assertThat(snapshot().size()).isEqualTo(4);
    assertThat(
            snapshot()
                .get(DevelopmentAccount.TENANT_TWO.email())
                .equals(before.get(DevelopmentAccount.TENANT_TWO.email())))
        .isTrue();
    assertThat(output.getAll().contains(originalPassword)).isFalse();
    assertThat(output.getAll().contains(existingHash)).isFalse();
    PASSWORDS.values().forEach(raw -> assertThat(output.getAll().contains(raw)).isFalse());
  }

  private void assertProvisioningLockIsAvailable() throws Exception {
    try (var c = connection("smartrent_app", APP_PASSWORD)) {
      c.setAutoCommit(false);
      try (var s = c.createStatement();
          var r = s.executeQuery("SELECT pg_try_advisory_xact_lock(1397904388)")) {
        r.next();
        assertThat(r.getBoolean(1)).isTrue();
      } finally {
        c.rollback();
      }
    }
  }
}
