package com.smartrent;

import com.smartrent.identity.persistence.DatabaseConfiguration;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import static org.assertj.core.api.Assertions.assertThat;

class DatabaseConfigurationTests {
    @ParameterizedTest
    @ValueSource(strings = {"spring.datasource.url", "spring.datasource.username", "spring.datasource.password",
            "spring.flyway.user", "spring.flyway.password"})
    void missingOrBlankDatabaseSettingsFailWithoutDisclosingValues(String missing) {
        for (String value : new String[]{"", "${SMARTRENT_MISSING_DATABASE_SETTING}"}) {
            new ApplicationContextRunner().withUserConfiguration(DatabaseConfiguration.class)
                    .withPropertyValues("spring.datasource.url=jdbc:postgresql://localhost/test",
                            "spring.datasource.username=runtime", "spring.datasource.password=synthetic-runtime-secret",
                            "spring.flyway.user=migrator", "spring.flyway.password=synthetic-migration-secret")
                    .withPropertyValues(missing + "=" + value)
                    .run(context -> {
                        assertThat(context).hasFailed();
                        assertThat(context.getStartupFailure()).hasMessageContaining(missing);
                        assertThat(context.getStartupFailure()).hasMessageNotContaining("synthetic-runtime-secret")
                                .hasMessageNotContaining("synthetic-migration-secret");
                    });
        }
    }
}
