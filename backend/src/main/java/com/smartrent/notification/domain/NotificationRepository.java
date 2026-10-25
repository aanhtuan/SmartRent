package com.smartrent.notification.domain;

import java.util.*;

public interface NotificationRepository {
  void create(Notification n);

  Notification find(UUID id, UUID recipient, boolean lock);

  List<Notification> list(UUID recipient, Boolean unread, int offset, int limit);

  Notification markRead(UUID id, UUID recipient);
}
