package com.smartrent.room.domain;

import java.util.*;

public interface RoomRepository {
  Room find(UUID id, boolean lock);

  Room save(Room value);

  List<Room> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit);
}
