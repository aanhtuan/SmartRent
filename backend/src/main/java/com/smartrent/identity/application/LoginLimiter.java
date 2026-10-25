package com.smartrent.identity.application;

import com.smartrent.shared.api.ApiFailure;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
public class LoginLimiter {
  private record Window(Instant until, int attempts) {}

  private final Map<String, Window> windows = new HashMap<>();
  private final Clock clock;

  public LoginLimiter(Clock clock) {
    this.clock = clock;
  }

  private String key(String value) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
    } catch (Exception ex) {
      throw new IllegalStateException("Digest unavailable");
    }
  }

  private Window window(String k) {
    return windows.getOrDefault(k, new Window(clock.instant().plusSeconds(900), 0));
  }

  private ApiFailure denied() {
    return new ApiFailure(429, "RATE_LIMITED", "Too many attempts. Try again later.");
  }

  public synchronized void attempt(String ip, String email) {
    windows.values().removeIf(w -> !w.until().isAfter(clock.instant()));
    String ik = key("ip:" + ip), pk = key("pair:" + ip + ":" + email);
    if (windows.size() > 9996 || window(ik).attempts() >= 30 || window(pk).attempts() >= 5)
      throw denied();
    var w = window(ik);
    windows.put(ik, new Window(w.until(), w.attempts() + 1));
  }

  public synchronized void failed(String ip, String email) {
    String k = key("pair:" + ip + ":" + email);
    var w = window(k);
    windows.put(k, new Window(w.until(), Math.min(5, w.attempts() + 1)));
  }
}
