package com.smartrent.room.application;

import java.util.UUID;

public interface RoomLifecycleGuard {
  java.util.Set<UUID> occupiedRooms(java.util.Collection<UUID> rooms);

  void ensureDeactivationAllowed(UUID roomId);

  boolean occupied(UUID roomId);

  boolean entitled(UUID roomId, UUID userId);
}
