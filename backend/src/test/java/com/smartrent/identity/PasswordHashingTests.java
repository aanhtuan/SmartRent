package com.smartrent.identity;

import com.smartrent.identity.application.PasswordHashingConfiguration;
import com.smartrent.identity.domain.Account;
import com.smartrent.identity.domain.AccountRole;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.util.Arrays;
import java.util.Locale;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringJUnitConfig(PasswordHashingConfiguration.class)
class PasswordHashingTests {
    @Autowired PasswordEncoder encoder;

    @Test
    void versionedArgon2idUsesIndependentSaltsAndRejectsWrongPassword() {
        String raw = UUID.randomUUID().toString();
        String first = encoder.encode(raw);
        String second = encoder.encode(raw);
        assertThat(first.startsWith("{argon2id-v1}$argon2id$v=19$m=19456,t=2,p=1$")).isTrue();
        assertThat(first.equals(second)).isFalse();
        assertThat(encoder.matches(raw, first)).isTrue();
        assertThat(encoder.matches(UUID.randomUUID().toString(), first)).isFalse();
    }

    @Test
    void identityDiagnosticStringRedactsCredentialsAndEmail() {
        String raw = UUID.randomUUID().toString();
        var account = new Account(UUID.randomUUID(), "synthetic@smartrent.test", raw, AccountRole.TENANT, true);
        assertThat(account.toString().contains(raw)).isFalse();
        assertThat(account.toString()).doesNotContain(account.email()).contains("REDACTED");
    }

    @Test
    void benchmarkApprovedParametersWithoutPrintingCredentials() {
        String raw = UUID.randomUUID().toString();
        encoder.matches(raw, encoder.encode(raw)); // Warm-up, not a production capacity claim.
        long[] encodeNanos = new long[5];
        long[] verifyNanos = new long[5];
        for (int i = 0; i < encodeNanos.length; i++) {
            long start = System.nanoTime();
            String hash = encoder.encode(raw);
            encodeNanos[i] = System.nanoTime() - start;
            start = System.nanoTime();
            assertThat(encoder.matches(raw, hash)).isTrue();
            verifyNanos[i] = System.nanoTime() - start;
        }
        Arrays.sort(encodeNanos);
        Arrays.sort(verifyNanos);
        System.out.printf(Locale.ROOT,
                "B01_ARGON2_BENCHMARK samples=5 salt_bytes=16 hash_bytes=32 memory_kib=19456 iterations=2 parallelism=1 encode_median_ms=%.2f verify_median_ms=%.2f%n",
                encodeNanos[2] / 1_000_000.0, verifyNanos[2] / 1_000_000.0);
    }
    @Test
    void noPlaintextOrUnknownVersionFallbackCanVerifyCredentials() {
        String raw = UUID.randomUUID().toString();
        for (String stored : new String[]{raw, "{noop}" + raw, "{argon2id-v2}" + raw}) {
            assertThatThrownBy(() -> encoder.matches(raw, stored))
                    .isInstanceOf(IllegalArgumentException.class);
        }
    }

}
