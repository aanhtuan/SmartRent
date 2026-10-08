package com.smartrent;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.web.ServerProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;

import static org.assertj.core.api.Assertions.assertThat;

class ServerConfigurationTests {

    @Test
    void failsFastWhenPortConfigurationCannotBeBound() {
        new ApplicationContextRunner()
                .withUserConfiguration(ServerConfiguration.class)
                .withPropertyValues("server.port=not-a-port")
                .run(context -> {
                    assertThat(context).hasFailed();
                    assertThat(context.getStartupFailure()).hasStackTraceContaining("server.port");
                });
    }

    @Configuration(proxyBeanMethods = false)
    @EnableConfigurationProperties(ServerProperties.class)
    static class ServerConfiguration {
    }
}
