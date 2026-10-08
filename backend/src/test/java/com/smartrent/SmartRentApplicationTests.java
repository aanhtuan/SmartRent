package com.smartrent;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.context.ApplicationContext;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetailsService;

import javax.sql.DataSource;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class SmartRentApplicationTests {

    @Autowired
    private TestRestTemplate http;

    @Autowired
    private ApplicationContext context;

    @Test
    void startsRealHttpServerWithoutDatabaseOrGeneratedAccounts() {
        var response = http.getForEntity("/actuator/health", String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo("{\"status\":\"UP\"}");
        assertThat(response.getHeaders().get("Set-Cookie")).isNull();
        assertThat(context.getBeansOfType(DataSource.class)).isEmpty();
        assertThat(context.getBeansOfType(UserDetailsService.class)).isEmpty();
    }

    @ParameterizedTest
    @ValueSource(strings = {"/actuator/env", "/actuator/configprops", "/actuator/beans",
            "/actuator/heapdump", "/actuator/info", "/actuator", "/api/users/me", "/login"})
    void deniesNonHealthRequestsWithoutExposingConfiguration(String path) {
        var response = http.getForEntity(path, String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(response.getHeaders().get("Set-Cookie")).isNull();
        assertThat(response.getHeaders().getFirst("Location")).isNull();
        assertThat(response.getBody()).isNullOrEmpty();
    }

    @Test
    void doesNotProvideAWriteOrLogoutRoute() {
        assertThat(http.postForEntity("/actuator/health", null, String.class).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(http.postForEntity("/logout", null, String.class).getStatusCode())
                .isEqualTo(HttpStatus.FORBIDDEN);
    }
}
