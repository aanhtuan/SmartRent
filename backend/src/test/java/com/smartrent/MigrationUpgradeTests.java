package com.smartrent;

import static org.assertj.core.api.Assertions.*;

import java.nio.file.Path;
import java.sql.*;
import java.util.*;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.utility.*;

@Testcontainers
class MigrationUpgradeTests {
  private static final String MIGRATOR = UUID.randomUUID().toString(),
      APP = UUID.randomUUID().toString();

  @Container
  static final PostgreSQLContainer<?> DB =
      new PostgreSQLContainer<>(
              DockerImageName.parse(
                      "postgres:17.11-bookworm@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826")
                  .asCompatibleSubstituteFor("postgres"))
          .withDatabaseName("upgrade_test")
          .withUsername("smartrent_admin")
          .withPassword(UUID.randomUUID().toString())
          .withEnv("DB_MIGRATION_PASSWORD", MIGRATOR)
          .withEnv("DB_PASSWORD", APP)
          .withCopyFileToContainer(
              MountableFile.forHostPath(
                  Path.of("..", "infra", "postgres", "01-roles.sh").toAbsolutePath()),
              "/docker-entrypoint-initdb.d/01-roles.sh");

  @Test
  void upgradesHistoricalIdentityWithoutChangingExistingDataOrV1Checksum() throws Exception {
    var historical =
        Flyway.configure()
            .dataSource(DB.getJdbcUrl(), "smartrent_migrator", MIGRATOR)
            .placeholders(Map.of("applicationRole", "smartrent_app"))
            .target("1")
            .load();
    historical.migrate();
    int checksum = historical.info().current().getChecksum();
    UUID id = UUID.randomUUID();
    String hash = "synthetic-upgrade-marker";
    try (var c = DriverManager.getConnection(DB.getJdbcUrl(), "smartrent_app", APP);
        var insert =
            c.prepareStatement(
                "INSERT INTO users(id,email,password_hash,role,is_active,created_at,updated_at)"
                    + " VALUES(?,?,?,'TENANT',false,'2020-01-01T00:00:00Z','2020-01-01T00:00:00Z')")) {
      insert.setObject(1, id);
      insert.setString(2, "upgrade@smartrent.test");
      insert.setString(3, hash);
      insert.executeUpdate();
    }
    var latest =
        Flyway.configure()
            .dataSource(DB.getJdbcUrl(), "smartrent_migrator", MIGRATOR)
            .placeholders(Map.of("applicationRole", "smartrent_app"))
            .load();
    latest.migrate();
    latest.validate();
    assertThat(latest.info().current().getVersion().toString()).isEqualTo("9");
    assertThat(latest.info().applied()[0].getChecksum()).isEqualTo(checksum);
    assertThat(latest.migrate().migrationsExecuted).isZero();
    try (var c = DriverManager.getConnection(DB.getJdbcUrl(), "smartrent_app", APP);
        var s =
            c.prepareStatement(
                "SELECT"
                    + " email,password_hash,role,is_active,created_at,updated_at,provisioned_by_user_id"
                    + " FROM users WHERE id=?")) {
      s.setObject(1, id);
      try (var rows = s.executeQuery()) {
        assertThat(rows.next()).isTrue();
        assertThat(rows.getString(1)).isEqualTo("upgrade@smartrent.test");
        assertThat(rows.getString(2).equals(hash)).isTrue();
        assertThat(rows.getString(3)).isEqualTo("TENANT");
        assertThat(rows.getBoolean(4)).isFalse();
        assertThat(rows.getTimestamp(5).toInstant())
            .isEqualTo(java.time.Instant.parse("2020-01-01T00:00:00Z"));
        assertThat(rows.getTimestamp(6).toInstant())
            .isEqualTo(java.time.Instant.parse("2020-01-01T00:00:00Z"));
        assertThat(rows.getObject(7)).isNull();
      }
      try (var statement = c.createStatement()) {
        assertThatThrownBy(() -> statement.execute("CREATE TABLE forbidden(id int)"))
            .isInstanceOf(SQLException.class);
        assertThatThrownBy(() -> statement.execute("DELETE FROM users"))
            .isInstanceOf(SQLException.class);
        assertThatThrownBy(() -> statement.execute("SELECT * FROM flyway_schema_history"))
            .isInstanceOf(SQLException.class);
      }
    }
  }
}
