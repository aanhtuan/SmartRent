package com.smartrent.aiintegration.application;

import com.smartrent.aiintegration.domain.Classification;
import com.smartrent.shared.api.ApiFailure;
import java.time.*;
import java.util.*;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("!foundation-test")
public class AiGateway {
  private final AiProvider provider;
  private final Clock clock;
  private final Map<UUID, List<Instant>> requests = new HashMap<>();

  public AiGateway(AiProvider p, Clock c) {
    provider = p;
    clock = c;
  }

  private synchronized void limit(UUID actor) {
    var before = clock.instant().minusSeconds(60);
    requests.values().forEach(v -> v.removeIf(t -> !t.isAfter(before)));
    requests.values().removeIf(List::isEmpty);
    if (requests.size() >= 10000 && !requests.containsKey(actor))
      throw new ApiFailure(429, "RATE_LIMITED", "AI rate limit exceeded.");
    var times = requests.computeIfAbsent(actor, a -> new ArrayList<>());
    if (times.size() >= 5) throw new ApiFailure(429, "RATE_LIMITED", "AI rate limit exceeded.");
    times.add(clock.instant());
  }

  public String minimized(String value) {
    return value
        .replaceAll("[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}", "[REDACTED]")
        .replaceAll("(?<![0-9])[+]?[0-9][0-9 .()-]{7,}[0-9]", "[REDACTED]");
  }

  public Classification classify(UUID actor, String description) {
    limit(actor);
    try {
      var result = provider.classify(minimized(description));
      if (result == null) throw new AiInvalid();
      return result;
    } catch (AiInvalid | AiUnavailable e) {
      throw e;
    } catch (RuntimeException e) {
      throw new AiUnavailable();
    }
  }

  public AiProvider.Answer answer(UUID actor, String question, String context) {
    limit(actor);
    try {
      var result = provider.answer(minimized(question), context);
      if (result == null) throw new AiInvalid();
      return result;
    } catch (AiInvalid | AiUnavailable e) {
      throw e;
    } catch (RuntimeException e) {
      throw new AiUnavailable();
    }
  }
}
