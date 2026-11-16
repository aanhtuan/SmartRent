package com.smartrent.notification;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import com.smartrent.notification.application.*;
import com.smartrent.notification.domain.NotificationRepository;
import com.smartrent.shared.application.BusinessNotice;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

class NotificationSseTests {
  private NotificationStreamService streamService;
  private NotificationRepository repo;
  private NotificationWriter writer;
  private NotificationService notificationService;

  @BeforeEach
  void setUp() {
    streamService = new NotificationStreamService();
    repo = mock(NotificationRepository.class);
    writer = mock(NotificationWriter.class);
    notificationService = new NotificationService(repo, writer, streamService);
  }

  @Test
  void registersSseEmitterAndTracksCount() {
    UUID userId = UUID.randomUUID();

    assertThat(streamService.getActiveEmitterCount(userId)).isEqualTo(0);

    SseEmitter emitter = streamService.createEmitter(userId);

    assertThat(emitter).isNotNull();
    assertThat(streamService.getActiveEmitterCount(userId)).isEqualTo(1);
  }

  @Test
  void broadcastReachesRegisteredUser() {
    UUID userId = UUID.randomUUID();
    SseEmitter emitter = streamService.createEmitter(userId);

    // Broadcast notice
    streamService.broadcast(userId, "sample payload");

    assertThat(streamService.getActiveEmitterCount(userId)).isEqualTo(1);
  }

  @Test
  void onNoticeDispatchesBroadcastAndWritesPersistence() {
    UUID recipientId = UUID.randomUUID();
    UUID sourceId = UUID.randomUUID();
    BusinessNotice notice = new BusinessNotice(recipientId, "PAYMENT_RECEIVED", "payment", sourceId);

    NotificationStreamService mockStream = mock(NotificationStreamService.class);
    NotificationService svc = new NotificationService(repo, writer, mockStream);

    svc.onNotice(notice);

    verify(writer).write(notice);
    verify(mockStream).broadcast(eq(recipientId), any());
  }
}
