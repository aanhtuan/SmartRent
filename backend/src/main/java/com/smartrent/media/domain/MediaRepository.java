package com.smartrent.media.domain;

import java.util.List;
import java.util.UUID;

public interface MediaRepository {
  MediaFile find(UUID id);

  MediaFile save(MediaFile file);

  List<MediaFile> findByTarget(String targetType, UUID targetId);

  void delete(UUID id);
}
