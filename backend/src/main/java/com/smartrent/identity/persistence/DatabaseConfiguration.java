package com.smartrent.identity.persistence;

import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;

/** Fail before connecting when required settings are missing; never print their values. */
@Configuration(proxyBeanMethods = false)
@Profile("!foundation-test")
public class DatabaseConfiguration {
    @Bean
    static BeanFactoryPostProcessor requireDatabaseSettings(Environment environment) {
        return factory -> {
            for (String property : new String[]{"spring.datasource.url", "spring.datasource.username",
                    "spring.datasource.password", "spring.flyway.user", "spring.flyway.password"}) {
                String value;
                try { value = environment.getProperty(property); }
                catch (IllegalArgumentException unresolved) {
                    throw new IllegalStateException("Set required database configuration: " + property);
                }
                if (value == null || value.isBlank() || value.contains("${")) {
                    throw new IllegalStateException("Set required database configuration: " + property);
                }
            }
        };
    }
}
