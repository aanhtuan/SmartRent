package com.smartrent.notification.application;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Profile("!foundation-test")
public class NotificationStreamService {
  private static final Logger log = LoggerFactory.getLogger(NotificationStreamService.class);
  private static final Long EMITTER_TIMEOUT = 300_000L; // 5 minutes

  private final Map<UUID, List<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

  public SseEmitter createEmitter(UUID userId) {
    var emitter = new SseEmitter(EMITTER_TIMEOUT);

    userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);

    emitter.onCompletion(() -> removeEmitter(userId, emitter));
    emitter.onTimeout(() -> removeEmitter(userId, emitter));
    emitter.onError(e -> removeEmitter(userId, emitter));

    try {
      emitter.send(
          SseEmitter.event()
              .name("connected")
              .data(Map.of("status", "connected", "userId", userId.toString())));
    } catch (IOException e) {
      log.debug("Failed to send initial SSE heartbeat to user {}", userId);
      removeEmitter(userId, emitter);
    }

    return emitter;
  }

  public void broadcast(UUID userId, Object payload) {
    var emitters = userEmitters.get(userId);
    if (emitters == null || emitters.isEmpty()) return;

    for (var emitter : emitters) {
      try {
        emitter.send(SseEmitter.event().name("notification").data(payload));
      } catch (IOException | IllegalStateException e) {
        removeEmitter(userId, emitter);
      }
    }
  }

  private void removeEmitter(UUID userId, SseEmitter emitter) {
    var list = userEmitters.get(userId);
    if (list != null) {
      list.remove(emitter);
      if (list.isEmpty()) {
        userEmitters.remove(userId);
      }
    }
  }

  public int getActiveEmitterCount(UUID userId) {
    var list = userEmitters.get(userId);
    return list == null ? 0 : list.size();
  }
}
