package com.smartrent.identity.application;

import static org.assertj.core.api.Assertions.*;

import com.smartrent.shared.api.ApiFailure;
import java.time.*;
import org.junit.jupiter.api.Test;

class LoginLimiterTests {
  static class Time extends Clock {
    Instant now = Instant.parse("2026-01-01T00:00:00Z");

    public ZoneId getZone() {
      return ZoneOffset.UTC;
    }

    public Clock withZone(ZoneId z) {
      return this;
    }

    public Instant instant() {
      return now;
    }
  }

  @Test
  void pairFailuresBlockAndExpire() {
    var time = new Time();
    var limiter = new LoginLimiter(time);
    for (int i = 0; i < 5; i++) {
      limiter.attempt("ip", "email");
      limiter.failed("ip", "email");
    }
    assertThatThrownBy(() -> limiter.attempt("ip", "email"))
        .isInstanceOf(ApiFailure.class)
        .extracting(e -> ((ApiFailure) e).status())
        .isEqualTo(429);
    time.now = time.now.plusSeconds(901);
    assertThatCode(() -> limiter.attempt("ip", "email")).doesNotThrowAnyException();
  }

  @Test
  void ipLimitCannotBeBypassedByChangingEmail() {
    var limiter = new LoginLimiter(new Time());
    for (int i = 0; i < 30; i++) limiter.attempt("same-ip", "synthetic-" + i);
    assertThatThrownBy(() -> limiter.attempt("same-ip", "new-email"))
        .isInstanceOf(ApiFailure.class);
    assertThatCode(() -> limiter.attempt("other-ip", "new-email")).doesNotThrowAnyException();
  }
}
