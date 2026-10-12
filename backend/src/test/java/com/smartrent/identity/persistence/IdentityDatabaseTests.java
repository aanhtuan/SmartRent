package com.smartrent.identity.persistence;

import jakarta.persistence.EntityManagerFactory;
import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.MountableFile;
import org.testcontainers.utility.DockerImageName;

import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@Testcontainers
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class IdentityDatabaseTests {
    private static final String MIGRATION_PASSWORD = UUID.randomUUID().toString();
    private static final String APP_PASSWORD = UUID.randomUUID().toString();

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>(DockerImageName.parse(
            "postgres:17.11-bookworm@sha256:3645570cccdfa447589da9f57dd740faa29b30938e861289a5574b6ca6b03826").asCompatibleSubstituteFor("postgres"))
            .withDatabaseName("smartrent_test")
            .withUsername("smartrent_admin")
            .withPassword(UUID.randomUUID().toString())
            .withEnv("DB_MIGRATION_PASSWORD", MIGRATION_PASSWORD)
            .withEnv("DB_PASSWORD", APP_PASSWORD)
            .withCopyFileToContainer(MountableFile.forHostPath(
                    Path.of("..", "infra", "postgres", "01-roles.sh").toAbsolutePath()),
                    "/docker-entrypoint-initdb.d/01-roles.sh");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", () -> "smartrent_app");
        registry.add("spring.datasource.password", () -> APP_PASSWORD);
        registry.add("spring.flyway.url", POSTGRES::getJdbcUrl);
        registry.add("spring.flyway.user", () -> "smartrent_migrator");
        registry.add("spring.flyway.password", () -> MIGRATION_PASSWORD);
        registry.add("spring.flyway.placeholders.applicationRole", () -> "smartrent_app");
    }

    @Autowired EntityManagerFactory entities;
    @Autowired Flyway flyway;
    @Autowired TestRestTemplate http;

    private Connection application() throws SQLException {
        return DriverManager.getConnection(POSTGRES.getJdbcUrl(), "smartrent_app", APP_PASSWORD);
    }

    @Test
    void migratesOnlyIdentityAndKeepsTheHttpBoundary() throws Exception {
        assertThat(flyway.info().current().getVersion().toString()).isEqualTo("1");
        try (var connection = application(); var statement = connection.createStatement()) {
            try (var rs = statement.executeQuery("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='users'")) {
                var columns = new java.util.HashSet<String>();
                while (rs.next()) columns.add(rs.getString(1));
                assertThat(columns).containsExactlyInAnyOrder("id", "email", "password_hash", "role", "is_active", "created_at", "updated_at");
            }
        }
        assertThat(http.getForEntity("/actuator/health", String.class).getBody()).isEqualTo("{\"status\":\"UP\"}");
        assertThat(http.getForEntity("/actuator/env", String.class).getStatusCode().value()).isEqualTo(403);
        assertThat(http.getForEntity("/api/users/me", String.class).getStatusCode().value()).isEqualTo(403);
    }

    @Test
    void jpaMappingNormalizesEmailAndMaintainsUtcTimestamps() throws Exception {
        var em = entities.createEntityManager();
        try {
            var record = new UserRecord("  JPA-" + UUID.randomUUID() + "@EXAMPLE.TEST  ", "synthetic-hash", UserRole.TENANT);
            em.getTransaction().begin();
            em.persist(record);
            em.getTransaction().commit();
            var created = record.updatedAt();
            assertThat(created).isBetween(Instant.now().minusSeconds(30), Instant.now().plusSeconds(1));
            var previousTimestamp = Instant.parse("2020-01-01T00:00:00Z");
            try (var connection = application(); var query = connection.prepareStatement(
                    "SELECT email,role,is_active,created_at,updated_at FROM users WHERE id=?")) {
                query.setObject(1, record.id());
                try (var row = query.executeQuery()) {
                    assertThat(row.next()).isTrue();
                    assertThat(row.getString("email")).startsWith("jpa-").endsWith("@example.test")
                            .isEqualTo(row.getString("email").strip().toLowerCase(java.util.Locale.ROOT));
                    assertThat(row.getString("role")).isEqualTo("TENANT");
                    assertThat(row.getBoolean("is_active")).isTrue();
                    assertThat(row.getTimestamp("created_at").toInstant())
                            .isEqualTo(row.getTimestamp("updated_at").toInstant());
                    assertThat(row.getTimestamp("created_at").toInstant())
                            .isBetween(created.minusSeconds(1), created.plusSeconds(1));
                }
                // An old persisted timestamp makes a missing update callback detectable without sleeps.
                try (var fixture = connection.prepareStatement(
                        "UPDATE users SET created_at=?,updated_at=? WHERE id=?")) {
                    fixture.setTimestamp(1, java.sql.Timestamp.from(previousTimestamp));
                    fixture.setTimestamp(2, java.sql.Timestamp.from(previousTimestamp));
                    fixture.setObject(3, record.id());
                    assertThat(fixture.executeUpdate()).isEqualTo(1);
                }
            }
            em.clear();
            em.getTransaction().begin();
            var loaded = em.find(UserRecord.class, record.id());
            loaded.deactivate();
            em.getTransaction().commit();
            assertThat(loaded.updatedAt()).isAfter(previousTimestamp);
            try (var connection = application(); var query = connection.prepareStatement(
                    "SELECT is_active,created_at,updated_at FROM users WHERE id=?")) {
                query.setObject(1, record.id());
                try (var row = query.executeQuery()) {
                    assertThat(row.next()).isTrue();
                    assertThat(row.getBoolean("is_active")).isFalse();
                    assertThat(row.getTimestamp("created_at").toInstant()).isEqualTo(previousTimestamp);
                    assertThat(row.getTimestamp("updated_at").toInstant()).isAfter(previousTimestamp)
                            .isBetween(Instant.now().minusSeconds(30), Instant.now().plusSeconds(1));
                }
            }
        } finally { em.close(); }
    }

    @Test
    void rejectsDuplicateEmailWithoutCommittingAnExtraIdentity() throws Exception {
        String email = UUID.randomUUID() + "@example.test";
        insert(email, "TENANT");
        assertThatThrownBy(() -> insert(email, "LANDLORD"))
                .isInstanceOf(SQLException.class).extracting("SQLState").isEqualTo("23505");
    }

    @Test
    void rejectsNoncanonicalEmailInvalidRoleAndNullFields() {
        assertSqlState("UPPER@example.test", "TENANT", "23514");
        assertSqlState(" padded@example.test ", "TENANT", "23514");
        assertSqlState("", "TENANT", "23514");
        assertSqlState(UUID.randomUUID() + "@example.test", "ADMIN", "23514");
        assertSqlState(null, "TENANT", "23502");
    }

    private void assertSqlState(String email, String role, String state) {
        assertThatThrownBy(() -> insert(email, role))
                .isInstanceOf(SQLException.class).extracting("SQLState").isEqualTo(state);
    }

    private void insert(String email, String role) throws SQLException {
        try (var connection = application(); var statement = connection.prepareStatement(
                "INSERT INTO users (id,email,password_hash,role) VALUES (?,?,?,?)")) {
            statement.setObject(1, UUID.randomUUID());
            statement.setString(2, email);
            statement.setString(3, "synthetic-hash");
            statement.setString(4, role);
            statement.executeUpdate();
        }
    }

    @Test
    void runtimeCannotCreateTablesDeleteUsersOrReadMigrationHistory() throws Exception {
        try (var connection = application(); var statement = connection.createStatement()) {
            for (String sql : new String[]{"CREATE TABLE forbidden_ddl(id uuid)", "DELETE FROM users", "SELECT * FROM flyway_schema_history"}) {
                assertThatThrownBy(() -> statement.execute(sql))
                        .isInstanceOf(SQLException.class).extracting("SQLState").isEqualTo("42501");
            }
            try (var rs = statement.executeQuery("SELECT rolsuper,rolcreatedb,rolcreaterole FROM pg_roles WHERE rolname=current_user")) {
                assertThat(rs.next()).isTrue();
                assertThat(rs.getBoolean(1) || rs.getBoolean(2) || rs.getBoolean(3)).isFalse();
            }
        }
    }

    @Test
    void secondMigrationRunPreservesVersionAndChecksum() {
        var checksum = flyway.info().current().getChecksum();
        assertThat(flyway.migrate().migrationsExecuted).isZero();
        assertThat(flyway.info().current().getChecksum()).isEqualTo(checksum);
        assertThat(flyway.validateWithResult().validationSuccessful).isTrue();
    }
}
