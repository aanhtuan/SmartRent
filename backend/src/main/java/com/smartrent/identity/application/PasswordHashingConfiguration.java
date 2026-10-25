package com.smartrent.identity.application;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.argon2.Argon2PasswordEncoder;
import org.springframework.security.crypto.password.DelegatingPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

@Configuration(proxyBeanMethods = false)
public class PasswordHashingConfiguration {
    @Bean
    PasswordEncoder accountPasswordEncoder() {
        var argon2id = new Argon2PasswordEncoder(16, 32, 1, 19 * 1024, 2);
        // Explicit version, no plaintext/legacy fallback and no implicit rehashing on provisioning.
        return new DelegatingPasswordEncoder("argon2id-v1", Map.of("argon2id-v1", argon2id));
    }
}
