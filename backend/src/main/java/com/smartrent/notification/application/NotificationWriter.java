package com.smartrent.notification.application;

import com.smartrent.notification.domain.*;
import com.smartrent.shared.application.BusinessNotice;
import java.time.Instant;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;

@Service
@Profile("!foundation-test")
public class NotificationWriter {
  private final NotificationRepository repo;

  public NotificationWriter(NotificationRepository r) {
    repo = r;
  }

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public void write(BusinessNotice e) {
    repo.create(
        new Notification(
            UUID.randomUUID(),
            e.recipient(),
            e.type(),
            "SmartRent: " + e.type(),
            null,
            Instant.now(),
            e.sourceType(),
            e.sourceId()));
  }
}
