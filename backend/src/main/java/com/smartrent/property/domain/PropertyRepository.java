package com.smartrent.property.domain;

import java.util.*;

public interface PropertyRepository {
  Property find(UUID id, boolean lock);

  Property save(Property value);

  List<Property> visible(
      UUID actor, boolean landlord, UUID filter, String status, int offset, int limit);
}
