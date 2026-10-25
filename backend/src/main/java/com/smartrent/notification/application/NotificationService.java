package com.smartrent.notification.application;

import com.smartrent.identity.application.Actor;
import com.smartrent.notification.domain.*;
import com.smartrent.shared.api.*;
import com.smartrent.shared.application.BusinessNotice;
import java.util.UUID;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.*;
import org.springframework.transaction.event.*;

@Service
@Profile("!foundation-test")
public class NotificationService {
  private final NotificationRepository repo;
  private final NotificationWriter writer;

  public NotificationService(NotificationRepository r, NotificationWriter w) {
    repo = r;
    writer = w;
  }

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void onNotice(BusinessNotice e) {
    try {
      writer.write(e);
    } catch (RuntimeException failure) {
      org.slf4j.LoggerFactory.getLogger(NotificationService.class)
          .warn("Notification persistence failed after business commit.");
    }
  }

  @Transactional(readOnly = true)
  public PageResponse<Notification> list(Actor a, Boolean unread, int page, int size) {
    return new PageResponse<>(
        repo.list(a.id(), unread, PageResponse.offset(page, size), size), page, size);
  }

  @Transactional(readOnly = true)
  public Notification get(Actor a, UUID id) {
    var n = repo.find(id, a.id(), false);
    if (n == null) throw ApiFailure.missing();
    return n;
  }

  @Transactional
  public Notification read(Actor a, UUID id) {
    var n = repo.markRead(id, a.id());
    if (n == null) throw ApiFailure.missing();
    return n;
  }
}
